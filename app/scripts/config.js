/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        List: {
            deps: [
                'jquery'
            ],
            exports: 'List'
        },
        Three: {
            exports: 'Three'
        },
        CSG: {
            exports: 'CSG'
        },
        FLOODCSG: {
            deps: ['CSG'],
            exports: 'FLOODCSG'
        },
        Viewport: {
            deps: [
                'Three',
                'OrbitControls'
            ],
            exports: 'Viewport'
        },
        OrbitControls: {
            deps: [
                'Three'
            ],
            exports: 'OrbitControls'
        },
        jqueryuislider: {
            deps: [
                'jquery',
                'jqueryuimouse',
                'jqueryuicore',
                'jqueryuiwidget'
            ],
            exports: 'jqueryuislider'
        },
        jqueryuidraggable: {
            deps: [
                'jquery',
                'jqueryuimouse',
                'jqueryuicore',
                'jqueryuiwidget'
            ],
            exports: 'jqueryuidraggable'
        },
        jqueryuimouse: {
            deps: [
                'jquery',
                'jqueryuiwidget'
            ],
            exports: 'jqueryuimouse'
        },
        jqueryuicore: {
            deps: [
                'jquery'
            ],
            exports: 'jqueryuicore'
        },
        jqueryuiwidget: {
            deps: [
                'jquery'
            ],
            exports: 'jqueryuiwidget'
        },
        bootstrap: {
            deps: [
                'jquery'
            ],
            exports: 'bootstrap'
        },
        almond: {
            deps: [
            ],
            exports: 'almond'
        }
    },
    paths: {

        // backbone collections
        Connections: 'collections/Connections',
        //Use DynamoSearchElements class in case of websocket connection, otherwise use FloodSearchElements
        SearchElements: 'collections/DynamoSearchElements', //'collections/FloodSearchElements'
        Nodes: 'collections/Nodes',
        Workspaces: 'collections/Workspaces',
        WorkspaceBrowserElements: 'collections/WorkspaceBrowserElements',

        // backbone models
        App: 'models/App',
        Connection: 'models/Connection',
        Marquee: 'models/Marquee',
        Node: 'models/nodes/Node',
        NumberNode: 'models/nodes/NumberNode',
        CodeBlockNode: 'models/nodes/CodeBlockNode',
        Search: 'models/Search',
        SearchElement: 'models/SearchElement',
        Workspace: 'models/Workspace',
        AbstractRunner: 'models/Runner',
        //Use DynamoRunner class in case of websocket connection, otherwise use FloodRunner
        Runner: 'models/DynamoRunner', // 'models/FloodRunner'
        Help: 'models/Help',
        Login: 'models/Login',
        WorkspaceBrowserElement: 'models/WorkspaceBrowserElement',
        WorkspaceBrowser: 'models/WorkspaceBrowser',
        SocketConnection: 'models/SocketConnection',
        Viewer: 'models/Viewer',

        CreateNodeCommand: 'models/commands/CreateNodeCommand',
        CreateNoteCommand: 'models/commands/CreateNoteCommand',
        DeleteModelCommand: 'models/commands/DeleteModelCommand',
        MakeConnectionCommand: 'models/commands/MakeConnectionCommand',
        ModelEventCommand: 'models/commands/ModelEventCommand',
        RecordableCommand: 'models/commands/RecordableCommand',
        RunCancelCommand: 'models/commands/RunCancelCommand',
        UpdateModelValueCommand: 'models/commands/UpdateModelValueCommand',

        Message: 'models/messages/Message',
        ModelsListMessage: 'models/messages/ModelsListMessage',

        //Responses
        ComputationResponse: 'models/responses/ComputationResponse',
        ContentResponse: 'models/responses/ContentResponse',

        //helpers
        commandsMap: 'helpers/CommandsMap',
        NodesFactory: 'helpers/NodesFactory',
        staticHelpers: 'helpers/StaticHelpers',

        // backbone views
        AppView: 'views/AppView',
        ConnectionView: 'views/ConnectionView',
        MarqueeView: 'views/MarqueeView',
        SearchView: 'views/SearchView',
        WorkspaceControlsView: 'views/WorkspaceControlsView',
        SearchElementView: 'views/SearchElementView',
        WorkspaceView: 'views/WorkspaceView',
        WorkspaceTabView: 'views/WorkspaceTabView',
        HelpView: 'views/HelpView',
        LoginView: 'views/LoginView',
        WorkspaceBrowserElementView: 'views/WorkspaceBrowserElementView',
        WorkspaceBrowserView: 'views/WorkspaceBrowserView',
        
        // node backbone views
        NodeViewTypes: 'views/NodeViews/NodeViews',
        BaseNodeView: 'views/NodeViews/Base',
        WatchNodeView: 'views/NodeViews/Watch',
        NumNodeView: 'views/NodeViews/Num',
        CodeBlockView: 'views/NodeViews/CodeBlock',
        FormulaView: 'views/NodeViews/Formula',

        CSGNodeView: 'views/NodeViews/ThreeCSG',

        OrbitControls: 'lib/OrbitControls',
        Viewport: 'lib/Viewport',
        FLOODCSG: 'lib/flood/flood_csg',
        FLOOD: 'lib/flood/flood',
        CSG: 'lib/flood/csg',
        scheme: 'lib/flood/scheme',

        // bower
        almond: '../bower_components/almond/almond',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        List: '../bower_components/listjs/dist/list.min',
        Three: '../bower_components/threejs/build/three.min',
        jqueryuislider: '../bower_components/jquery.ui/ui/jquery.ui.slider',
        jqueryuidraggable: '../bower_components/jquery.ui/ui/jquery.ui.draggable',
        jqueryuicore: '../bower_components/jquery.ui/ui/jquery.ui.core',
        jqueryuimouse: '../bower_components/jquery.ui/ui/jquery.ui.mouse',
        jqueryuiwidget: '../bower_components/jquery.ui/ui/jquery.ui.widget',
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone-amd/backbone',
        underscore: '../bower_components/underscore-amd/underscore',
    }

});



