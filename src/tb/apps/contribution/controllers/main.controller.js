define(['tb.core', 'contribution.view.index'], function (Core, IndexView) {
    'use strict';
    Core.ControllerManager.registerController('MainController', {
        appName: 'contribution',
        config: {
            imports: []
        },
        /**
         * Initialize of Contribution Controller
         */
        onInit: function () {
            this.mainApp = Core.get('application.main');
            this.mediaLibraryIsLoaded = false;
            this.mediaLibrary = false;
        },

        /**
         * Index action
         * Show the edition toolbar
         */
        indexAction: function () {
            var config = {},
                view;
            Core.Scope.register('contribution');
            if (this.viewIsLoaded !== true) {
                this.viewIsLoaded = true;
            } else {
                config.alreadyLoaded = true;
            }
            view = new IndexView(config);
            view.render();
        },

        showMediaLibraryService: function (config) {
            var self = this;
            if (!this.mediaLibraryIsLoaded) {
                require(['component!medialibrary'], function (MediaLibraryComponent) {
                    self.mediaLibrary = MediaLibraryComponent.createMediaLibrary(config);
                    self.mediaLibraryIsLoaded = true;
                    self.mediaLibrary.display();
                });
            } else {
                self.mediaLibrary.display();
            }
        }
    });
});