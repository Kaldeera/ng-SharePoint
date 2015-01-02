/*
    SPRibbon - factory
    
    Pau Codina (pau.codina@kaldeera.com)
    Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

    Copyright (c) 2014
    Licensed under the MIT License
*/



///////////////////////////////////////
//  SPRibbon
///////////////////////////////////////

(function() {
    
    'use strict';

    angular
        .module('ngSharePoint')
        .factory('SPRibbon', SPRibbon);


    SPRibbon.$inject = ['$q', '$timeout'];


    /* @ngInject */
    function SPRibbon($q, $timeout) {

        var pageManager, ribbon, commandDispatcher;
        var ribbonDeferred = $q.defer();
        var toolbarSequence = 1;
        var buttonSequence = 1;


        var spRibbonService = {

            ready                       : ready,
            refresh                     : refresh,
            addTab                      : addTab,
            getTab                      : getTab,
            getEditTab                  : getEditTab,
            getDefaultTab               : getDefaultTab,
            addGroupToTab               : addGroupToTab,
            addLayoutToGroup            : addLayoutToGroup,
            addSectionToLayout          : addSectionToLayout,
            addButtonToSection          : addButtonToSection,
            registerComponentCommands   : registerComponentCommands,
            unregisterComponentCommands : unregisterComponentCommands,
            getStructure                : getStructure,
            createToolbar               : createToolbar,
            addButtonToToolbar          : addButtonToToolbar,
            registerCommand             : registerCommand

        };


        return spRibbonService;



        ///////////////////////////////////////////////////////////////////////////////



        function onRibbonInited() {

            ribbon = pageManager.get_ribbon();
            commandDispatcher = pageManager.get_commandDispatcher();

            ribbonDeferred.resolve();

        } // onRibbonInited



        function ready() {

            // Initialize ribbon
            SP.SOD.executeOrDelayUntilScriptLoaded(function () {

                pageManager = SP.Ribbon.PageManager.get_instance();

                // Adds a new event handler for the page manager 'RibbonInited' event.
                pageManager.add_ribbonInited(onRibbonInited);

                // Try to get the ribbon
                try {

                    ribbon = pageManager.get_ribbon();

                }
                catch (e) { }


                if (!ribbon) {

                    if (typeof (_ribbonStartInit) == "function") {

                        _ribbonStartInit(_ribbon.initialTabId, false, null);

                    }

                } else {

                    onRibbonInited();

                }

            }, "sp.ribbon.js");


            return ribbonDeferred.promise;

        } // ready



        function refresh() {

            ribbon.refresh();

        } // refresh



        function addTab(id, title, description, commandId, hidden, contextualGroupId, cssClass) {

            var tab = new CUI.Tab(ribbon, id, title, description, commandId, hidden || false, contextualGroupId || '', cssClass || null);
            ribbon.addChild(tab);
            ribbon.refresh();

            return tab;

        } // addTab



        function getTab(id) {

            // Gets tab by id
            var tab = ribbon.getChild(id);

            if (tab === null) {

                // Gets tab by title
                tab = ribbon.getChildByTitle(id);

            }

            return tab;

        } // getTab



        function getEditTab() {

            var editTab = ribbon.getChild('Ribbon.ListForm.Edit');

            if (editTab === null) {
                // Try with Document library edit tab
                editTab = ribbon.getChild('Ribbon.DocLibListForm.Edit');
            }


            if (editTab === null) {
                // Try with Posts list edit tab
                editTab = ribbon.getChild('Ribbon.PostListForm.Edit');
            }

            return editTab;

        } // getEditTab



        function getDefaultTab() {

            return ribbon.getChild(ribbon.get_selectedTabId());

        } // getDefaultTab



        function addGroupToTab(tabId, id, title, description, commandId) {

            var tab = ribbon.getChild(tabId);
            var group, layout, section;

            if (tab !== null) {

                group = new CUI.Group(ribbon, id, title, description, commandId, null);
                tab.addChild(group);

                layout = addLayoutToGroup(group);
                section = addSectionToLayout(layout);
                ribbon.refresh();

            }

            return {
                group: group,
                layout: layout,
                section: section
            };

        } // addGroupToTab



        function addLayoutToGroup(group) {

            var layoutId = group.get_id() + '.Layout';
            var layout = new CUI.Layout(ribbon, layoutId, layoutId);
            group.addChild(layout);
            //group.selectLayout(layoutId);

            return layout;

        } // addLayoutToGroup



        function addSectionToLayout(layout) {

            var sectionId = layout.get_id() + '.Section';
            var section = new CUI.Section(ribbon, sectionId, 2, 'Top'); //-> Type = 2 = One row
            /*
                The 'Type' argument in the CUI.Section constructor can be one of the following values:

                    1: The section will be a vertical separator and can't add other elements inside.
                    2: The section will have one row (1)
                    3: The section will have two rows (1 and 2)
                    4: The section will have three rows (1, 2 and 3)
            */
            layout.addChild(section);

            return section;

        } // addSectionToLayout



        function createButtonProperties(id, label, tooltip, description, btnImage) {

            var controlProperties = new CUI.ControlProperties();

            controlProperties.Command = id;// + '.Command';
            controlProperties.Id = id + '.ControlProperties';
            controlProperties.TemplateAlias = 'o1';
            /*
                Property: TemplateAlias
                The TemplateAlias property is used to specify which template alias to use from 
                the Group Template Layout. That is how the control is positioned, which section 
                or row. This property must be a string value corresponding to one of the aliases 
                defined in the group template layout.

                See 'RibbonTemplates' at the end of the file 'CMDUI.XML' (<15_deep>\TEMPLATE\GLOBAL\CMDUI.XML).
                Also see these recomendations: http://www.andrewconnell.com/blog/Always-Create-Your-Own-Group-Templates-with-SharePoint-Ribbon-Customizations
            */
            controlProperties.Image32by32 = btnImage || '_layouts/15/images/placeholder32x32.png';
            controlProperties.ToolTipTitle = tooltip || label;
            controlProperties.ToolTipDescription = description || tooltip || '';
            controlProperties.LabelText = label;

            return controlProperties;

        } // createButtonProperties



        function addButtonToSection(section, id, label, tooltip, description, btnImage) {

            var button = new CUI.Controls.Button(ribbon, id, createButtonProperties(id, label, tooltip, description, btnImage));
            var controlComponent = button.createComponentForDisplayMode('Large'); //-> 'Large', 'Medium', 'Small', 'Menu|Menu16', 'Menu32', ''
            var row = section.getRow(1); // Assumes section of type 2 (one row). It could also be type 3 or 4 and in this case always use the row 1.
            row.addChild(controlComponent);

        } // addButtonToSection



        function showEditingTools() {

            var commandId = 'CommandContextChanged';
            var properties = new CUI.CommandContextSwitchCommandProperties();

            properties.ChangedByUser = false;
            properties.NewContextComand = 'CPEditTab';
            properties.NewContextId = 'Ribbon.EditingTools.CPEditTab';
            properties.OldContextCommand = 'Ribbon.ListForm.Edit';
            properties.OldContextId = 'Ribbon.ListForm.Edit';

            return commandDispatcher.executeCommand(commandId, properties);

        } // showEditingTools



        function _validateCommands(commands) {

            if (!angular.isArray(commands)) {

                if (angular.isString(commands)) {

                    commands = [commands];

                } else {

                    // No valid commands specified
                    return false;

                }
            }

            return commands;

        } // _validateCommands



        function registerComponentCommands(componentId, commands) {

            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                commandDispatcher.registerMultipleCommandHandler(component, cmds);
                ribbon.refresh();
                return true;

            }

            return false;

        } // registerComponentCommands



        function unregisterComponentCommands(componentId, commands) {

            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                commandDispatcher.unregisterMultipleCommandHandler(component, cmds);
                ribbon.refresh();
                return true;

            }

            return false;

        } // unregisterComponentCommands



        function _getRibbonStructure(fromNode) {

            var structure = {};
            var items = fromNode.$6_0;

            if (items) {

                var enumerator = items.getEnumerator();

                while (enumerator.moveNext()) {
                    
                    var item = enumerator.get_current();

                    // TODO: Si el item es un 'CUI_Tab', acceder al tab para inicializarlo antes de obtener su estructura.
                    //       De lo contrario estará vacío si no se ha accedido anteriormente :(

                    structure[item.get_id()] = item;
                    angular.extend(structure[item.get_id()], _getRibbonStructure(item));

                }

            }

            return structure;

        } // _getRibbonStructure



        function getStructure() {

            // Gets the current selected tab id
            var selectedTabId = ribbon.get_selectedTabId();

            // Gets the ribbon structure
            var ribbonStructure = _getRibbonStructure(ribbon);

            // Restore selected tab
            ribbon.selectTabById(selectedTabId);

            return ribbonStructure;

        } // getStructure



        function createToolbar(name, targetTab) {

            var groupName = name || 'Toolbar ' + _getNextToolbarSequence();
            var groupId = 'Ribbon.ngSharePoint.' + groupName.replace(/ /g, '-');
            var groupCommandId = groupId + '.Command';
            var tab, toolbar;


            // Checks for 'targetTab'
            if (targetTab) {

                tab = getTab(targetTab);

                // If specified tab do not exists, creates a new one.
                if (tab === null) {

                    // Creates a new tab
                    var tabId = 'Ribbon.ngSharePoint.' + targetTab.replace(/ /g, '-');
                    tab = addTab(tabId, targetTab, '', tabId + '.Command');
                    registerCommand(tabId + '.Command', angular.noop, true);

                }

            } else {

                // Gets the default selected tab (View|Edit).
                tab = getDefaultTab();

            }


            // Adds the toolbar as a new group in the tab.
            toolbar = addGroupToTab(tab.get_id(), groupId, groupName, groupCommandId);
            registerCommand(groupCommandId, angular.noop, true);

            return toolbar;

        } // createToolbar



        function addButtonToToolbar(toolbar, label, handlerFn, tooltip, description, btnImage, canHandle) {

            var buttonId = toolbar.group.get_id() + '.Button-' + _getNextButtonSequence();

            addButtonToSection(toolbar.section, buttonId, label, tooltip, description, btnImage);
            toolbar.group.selectLayout(toolbar.layout.get_id());
            registerCommand(buttonId, handlerFn, canHandle);

        } // addButtonToToolbar



        function _getNextToolbarSequence() {

            return toolbarSequence++;

        } // _getNextToolbarSequence



        function _getNextButtonSequence() {

            return buttonSequence++;

        } // _getNextButtonSequence



        function registerCommand(commandId, handlerFn, canHandle) {

            var component = pageManager.getPageComponentById('ngSharePointPageComponent');

            if (!component) {

                component = registerPageComponent();

            }

            // Adds the command to the 'ngSharePointPageComponent' component.
            if (component.addCommand(commandId, handlerFn, canHandle)) {

                // Register the command in the CommandDispatcher of the CUI.Page.PageComponent
                registerComponentCommands(component.getId(), commandId);

            }

        } // registerCommand



        function registerPageComponent() {

            // Register the type 'ngSharePointPageComponent'.
            Type.registerNamespace('ngSharePointPageComponent');


            // Initialize the 'ngSharePointPageComponent' members
            ngSharePointPageComponent = function() {

                ngSharePointPageComponent.initializeBase(this);

            };


            ngSharePointPageComponent.initializePageComponent = function() {

                var instance = ngSharePointPageComponent.get_instance();

                pageManager.addPageComponent(instance);

                return instance;

            };


            ngSharePointPageComponent.get_instance = function() {

                if (!angular.isDefined(ngSharePointPageComponent.instance)) {

                    ngSharePointPageComponent.instance = new ngSharePointPageComponent();

                }

                return ngSharePointPageComponent.instance;

            };


            ngSharePointPageComponent.prototype = {

                // Create an array of handled commands with handler methods
                init: function() {

                    this._commands = [];
                    this._handledCommands = {};

                },


                getGlobalCommands: function() {

                    return this._commands;

                },


                getFocusedCommands: function() {

                    return [];

                },


                handleCommand: function(commandId, properties, sequence) {

                    return this._handledCommands[commandId].handle(commandId, properties, sequence);

                },


                canHandleCommand: function(commandId) {

                    var canHandle = this._handledCommands[commandId].enabled;

                    if (angular.isFunction(canHandle)) {

                        return canHandle();

                    }

                    return !!canHandle;

                },


                isFocusable: function() {

                    return false;

                },


                receiveFocus: function() {

                    return true;

                },


                yieldFocus: function() {

                    return false;

                },


                getId: function() {

                    return 'ngSharePointPageComponent';

                },


                addCommand: function(commandId, handlerFn, canHandle) {

                    if (!CUI.ScriptUtility.isNullOrUndefined(commandId) && !CUI.ScriptUtility.isNullOrUndefined(handlerFn) && !Array.contains(this._commands, commandId)) {

                        this._handledCommands[commandId] = {

                            handle: handlerFn,
                            enabled: canHandle

                        };

                        this._commands.push(commandId);

                        return true;

                    }

                    return false;

                }

            };


            // Unregister the default 'save', 'cancel' and 'attach file' commands
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Commit.Publish');
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Commit.Cancel');
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Actions.AttachFile');


            // Register classes and initialize page component
            ngSharePointPageComponent.registerClass('ngSharePointPageComponent', CUI.Page.PageComponent);
            var instance = ngSharePointPageComponent.initializePageComponent();


            // Returns the component instance
            return instance;

        } // registerPageComponent

    } // SPRibbon factory

})();
