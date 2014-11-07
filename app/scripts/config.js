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
        jqueryuimouse: {
            deps: [
                'jquery',
                'jqueryuiwidget'
            ],
            exports: 'jqueryuimouse'
        },
        jqueryuitouchpunch: {
            deps: [
                'jquery',
                'jqueryuicore',
                'jqueryuimouse'
            ],
            exports: 'jqueryuitouchpunch'
        },
        jqueryuislider: {
            deps: [
                'jquery',
                'jqueryuitouchpunch',
                'jqueryuimouse',
                'jqueryuicore',
                'jqueryuiwidget'
            ],
            exports: 'jqueryuislider'
        },
        jqueryuidraggable: {
            deps: [
                'jquery',
                'jqueryuitouchpunch',
                'jqueryuimouse',
                'jqueryuicore',
                'jqueryuiwidget'
            ],
            exports: 'jqueryuidraggable'
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
        SearchElements: 'collections/DynamoSearchElements', // 'collections/FloodSearchElements'
        Nodes: 'collections/Nodes',
        Workspaces: 'collections/Workspaces',
        WorkspaceBrowserElements: 'collections/WorkspaceBrowserElements',

        // backbone models
        //Use DynamoApp class in case of websocket connection, otherwise use App
        App: 'models/DynamoApp', // 'models/App'
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
        Feedback: 'models/Feedback',
        Login: 'models/Login',

        GeometryExport: 'models/GeometryExport',
        WorkspaceResolver: 'models/WorkspaceResolver',
        WorkspaceBrowserElement: 'models/WorkspaceBrowserElement',
        WorkspaceBrowser: 'models/WorkspaceBrowser',
        SocketConnection: 'models/SocketConnection',

        CreateNodeCommand: 'models/commands/CreateNodeCommand',
        CreateProxyNodeCommand: 'models/commands/CreateProxyNodeCommand',
        CreateNoteCommand: 'models/commands/CreateNoteCommand',
        DeleteModelCommand: 'models/commands/DeleteModelCommand',
        MakeConnectionCommand: 'models/commands/MakeConnectionCommand',
        ModelEventCommand: 'models/commands/ModelEventCommand',
        RecordableCommand: 'models/commands/RecordableCommand',
        RunCancelCommand: 'models/commands/RunCancelCommand',
        UpdateModelValueCommand: 'models/commands/UpdateModelValueCommand',
        CreateCustomNodeCommand: 'models/commands/CreateCustomNodeCommand',

        RecordableCommandsMessage: 'models/messages/RecordableCommandsMessage',
        LibraryItemsListMessage: 'models/messages/LibraryItemsListMessage',
        SaveFileMessage: 'models/messages/SaveFileMessage',
        GeometryMessage: 'models/messages/GeometryMessage',
        UploadFileMessage: 'models/messages/UploadFileMessage',
        SetModelPositionMessage: 'models/messages/SetModelPositionMessage',

        //Responses
        ComputationResponse: 'models/responses/ComputationResponse',
        ContentResponse: 'models/responses/ContentResponse',
        LibraryItemsListResponse: 'models/responses/LibraryItemsListResponse',
        SavedFileResponse: 'models/responses/SavedFileResponse',
        NodeCreationDataResponse: 'models/responses/NodeCreationDataResponse',
        UpdateProxyNodesResponse: 'models/responses/UpdateProxyNodesResponse',
        GeometryDataResponse: 'models/responses/GeometryDataResponse',
        WorkspacePathResponse: 'models/responses/WorkspacePathResponse',

        //helpers
        commandsMap: 'helpers/CommandsMap',
        NodeFactory: 'helpers/NodeFactory',
        staticHelpers: 'helpers/StaticHelpers',
        augment: 'helpers/augment',
        // Use BaseStorage if no actual data storage is required
        Storage: 'helpers/MongoStorage', //'helpers/BaseStorage',
        settings: 'helpers/Settings',

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
        FeedbackView: 'views/FeedbackView',
        LoginView: 'views/LoginView',
        WorkspaceBrowserElementView: 'views/WorkspaceBrowserElementView',
        WorkspaceBrowserView: 'views/WorkspaceBrowserView',
        ModelsListView: 'views/ModelsListView',
        SearchCategoryView: 'views/SearchCategoryView',
        SaveUploader: 'views/BaseSaveUploader', //'views/NWKSaveUploader',

        // node backbone views
        NodeViewTypes: 'views/NodeViews/NodeViews',
        BaseNodeView: 'views/NodeViews/Base',
        WatchNodeView: 'views/NodeViews/Watch',
        NumNodeView: 'views/NodeViews/Num',
        CodeBlockView: 'views/NodeViews/CodeBlock',
        FormulaView: 'views/NodeViews/Formula',
        InputView: 'views/NodeViews/Input',
        OutputView: 'views/NodeViews/Output',
        CustomNodeView: 'views/NodeViews/CustomNode',
        ThreeCSGNodeView: 'views/NodeViews/ThreeCSG',

        OrbitControls: 'lib/OrbitControls',
        Viewport: 'lib/Viewport',
        FLOODCSG: 'lib/flood/flood_csg',
        FLOOD: 'lib/flood/flood',
        CSG: 'lib/flood/csg',
        scheme: 'lib/flood/scheme',

        // bower
        Hammer: '../bower_components/hammerjs/hammer',
        almond: '../bower_components/almond/almond',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        List: '../bower_components/listjs/dist/list.min',
        Three: '../bower_components/threejs/build/three.min',
        jqueryuitouchpunch: '../bower_components/jqueryui-touch-punch/jquery.ui.touch-punch',
        jqueryuislider: '../bower_components/jquery.ui/ui/jquery.ui.slider',
        jqueryuidraggable: '../bower_components/jquery.ui/ui/jquery.ui.draggable',
        jqueryuicore: '../bower_components/jquery.ui/ui/jquery.ui.core',
        jqueryuimouse: '../bower_components/jquery.ui/ui/jquery.ui.mouse',
        jqueryuiwidget: '../bower_components/jquery.ui/ui/jquery.ui.widget',
        jquery: '../bower_components/jquery/jquery.min',
        backbone: '../bower_components/backbone-amd/backbone-min',
        underscore: '../bower_components/underscore-amd/underscore-min',
        fastclick: '../bower_components/fastclick/lib/fastclick',
        FileSaver: '../bower_components/FileSaver/FileSaver'
    }
});



