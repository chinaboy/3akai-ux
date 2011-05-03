/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

require(["jquery", "sakai/sakai.api.core", "/dev/lib/jquery/plugins/jquery.jeditable.js"], function($, sakai) {
    /**
     * @name sakai.collections
     *
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.collectionsarchview = function(tuid, showSettings) {

        var rootel = "#" + tuid;
        var $rootel = $("#" + tuid);

        var $widget_title = $("#widget_title", $rootel);

        // Containers
        var $collections_main_container = $("#collections_main_container", $rootel);
        var $collections_settings = $("#collections_settings", $rootel);
        var $collections_header = $("#collections_header", $rootel);
        var $collections_map = $("#collections_map", $rootel);
        var $collections_map_room_edit = $("#collections_map_room_edit", $rootel);
        var $collections_map_room_edit_container = $("#collections_map_room_edit_container", $rootel);
        var $categories_listing_body = $("#categories_listing_body", $rootel);
        var $collections_map_show_room = $("#collections_map_show_room", $rootel);
        var $collections_map_show_room_conatiner = $("#collections_map_show_room_conatiner", $rootel);
        var $collections_map_add_content = $("#collections_map_add_content", $rootel);
        var $collections_map_add_content_container = $("#collections_map_add_content_container", $rootel);
        var $category_dropdown = $("#category_dropdown", $rootel);
        var $collections_map_show_content_item = $("#collections_map_show_content_item", $rootel);
        var $collections_map_show_content_item_container = $("#collections_map_show_content_item_container", $rootel);

        // Templates
        var collectionsMapTemplate = "collections_map_template";
        var collectionsHeaderTemplate = "collections_header_template";
        var collectionsEditRoomTemplate = "collections_map_room_edit_template";
        var categoriesListingBodyTemplate = "collections_map_categories_listing_body_template";
        var collectionsShowRoomTemplate = "collections_map_show_room_template";
        var collectionsAddContentTemplate = "collections_map_add_content_template";
        var collectionsCategoryDropdownTemplate = "category_dropdown_template";
        var collectionsShowContentItemTemplate = "collections_map_show_content_item_template";

        // Buttons
        var $collectionsSettingsSubmit = $("#collections_settings_submit", $rootel);
        var $collectionsSettingsCancel = $("#collections_settings_cancel", $rootel);
        var $addCategoryButton = $("#do_add_category", $rootel);
        var $browseForFilesButton = $(".browse_for_files", $rootel);
        var $browseForContentFileButton = $(".browse_for_content_file", $rootel);

        // Links
        var returnToFloorplanLink = ".return_to_floorplan_link";
        var collectionsRoomCategoryItem = ".room_categories span a";
        var collectionsEditRoomLink = ".edit_this_room_link";
        var collectionsAddContentLink = ".add_content_link";
        var $collectionsReturnToFloorplanFromEdit = $("#return_to_floorplan_from_edit", $rootel);
        var $collectionsReturnToRoomFromEdit = $("#return_to_room_from_edit", $rootel);
        var $collectionsReturnToRoomFromEditContentItem = $("#return_to_room_from_edit_content_item", $rootel);
        var $collectionsReturnToFloorplanFromShow = $("#return_to_floorplan_from_show", $rootel);
        var collectionsViewContentLink = "div.room_categories span a";
        var collectionsEditContentLink = ".edit_this_content_link";
        var $collectionsReturnToContentFromEditLink = $("#return_to_content_from_edit", $rootel);

        // Form
        var $collectionsEditForm = $("#collections_map_room_edit form", $rootel);
        var $collectionsAddContentForm = $("#collections_map_add_content form", $rootel);
        var $addCategoryTextField = $("#add_category", $rootel);

        // Layout Selection
        var $collectionsHeaderSelectLayout = $("#collections_header_select_layout", $rootel);
        var $collectionsHeaderSelectLayoutTemplate = $("#collections_header_select_layout_template", $rootel);

        // Album View
        var $collectionsAlbums = $("#collections_albums", $rootel);
        var $collectionsAlbumsTemplate = $("#collections_albums_template", $rootel);
        var $collectionsAlbumsShowAlbum = $("#collections_albums_show_album", $rootel);
        var $collectionsAlbumsShowAlbumTemplate = $("#collections_albums_show_album_template", $rootel);
        var $collectionsAlbumShowCategory = $("#collections_albums_show_category", $rootel);
        var $collectionsAlbumShowCategoryTemplate = $("#collections_albums_show_category_template", $rootel);
        var $collectionsAlbumsShowItem = $("#collections_albums_show_item", $rootel);
        var $collectionsAlbumsShowItemTemplate = $("#collections_albums_show_item_template", $rootel);

        var settings = {},
            collectionData = {},
            widgetData = {},
            currentCollectionData = {},
            currentContentItemData = {},
            currentCategoryData = {},
            currentItemData = {},
            fromViewRoom = false,
            selectedCollectionID = -1,
            clickedCollectionID = -1,
            clickedCategoryID = -1,
            selectedCategoryID = -1,
            clickedItemID = -1,
            selectedItemID = -1,
            firstRender = true,
            removedEverything = false;


        /**
         * Universal Functions
         */

        var getWidgetData = function() {
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    settings = data.settings;
                    settings.displayStyle = "mapView";
                    collectionData = data.collectionData;
                    if (showSettings) {
                        $widget_title.val(settings.widgetTitle);
                    } else {
                        $collections_header.show();
                        settings.sakai = sakai;
                        sakai.api.Util.TemplateRenderer(collectionsHeaderTemplate, settings, $collections_header);
                        sakai.api.Util.TemplateRenderer($collectionsHeaderSelectLayoutTemplate, settings, $collectionsHeaderSelectLayout);
                        parseState();
                    }
                } else {
                    collectionData = {
                        "collections": []
                    };
                    settings.widgetTitle = "title";
                    settings.displayStyle = "mapView";
                    return;
                }
            });
        };

        var saveWidgetData = function() {
            delete collectionData.sakai;
            widgetData.collectionData = collectionData;
            delete settings.sakai;
            widgetData.settings = settings;
            sakai.api.Widgets.saveWidgetData(tuid, widgetData, function(success, data) {
                if (success) {
                    if (showSettings) {
                        sakai.api.Widgets.Container.informFinish(tuid, "collections");
                    }
                }
            });
        };

        var setupWidgetSettingsForSave = function() {
            settings = {};
            var title = $widget_title.val();
            if ($.trim(title) === "") {
                alert($("collections_title_empty").text());
            }
            settings.widgetTitle = title;
            settings.displayStyle = "mapView";
        };

        var prepareCollectionDataForPost = function() {
            var thisCollectionData = currentCollectionData;
            var collectionExists = false;
            // Put the room's data back into the collectionData object
            for (var i = 0; i < collectionData.collections.length; i++) {
                if (collectionData.collections[i].id == selectedCollectionID) {
                    collectionExists = true;
                    collectionData.collections[i] = thisCollectionData;
                    break;
                }
            }

            // if we're not editing, just push it onto the data stack
            if (!collectionExists) {
                collectionData.collections.push(thisCollectionData);
            }

            return collectionData;
        };

        var saveCollectionData = function() {
            collectionData = prepareCollectionDataForPost();
            saveWidgetData();
        };

        var prepareCategoryDataForPost = function() {
            var thisCategoryData = currentCategoryData;
            var categoryExists = false;
            if (currentCollectionData.categories) {
                for (var i = 0; i < currentCollectionData.categories.length; i++) {
                    if (currentCollectionData.categories[i].id == selectedCategoryID) {
                        categoryExists = true;
                        currentCollectionData.categories[i] = thisCategoryData;
                        break;
                    }
                }
            } else {
                currentCollectionData.categories = [];
            }

            // if we're not editing, just push it onto the data stack
            if (!categoryExists) {
                currentCollectionData.categories.push(thisCategoryData);
            }

        };

        var saveCategoryData = function() {
            prepareCategoryDataForPost();
            saveCollectionData();
        };

        var prepareItemDataForPost = function() {
            var thisItemData = currentItemData;
            var itemExists = false;
            if (currentCategoryData.items) {
                for (var i = 0; i < currentCategoryData.items.length; i++) {
                    if (currentCategoryData.items[i].id == selectedItemID) {
                        itemExists = true;
                        currentCategoryData.items[i] = thisItemData;
                        break;
                    }
                }
            } else {
                currentCategoryData.items = [];
            }

            // if we're not editing, just push it onto the data stack
            if (!itemExists) {
                currentCategoryData.items.push(thisItemData);
            }

        };

        var saveItemData = function() {
            prepareItemDataForPost();
            saveCategoryData();
        };

        var saveWidgetSettings = function() {
            setupWidgetSettingsForSave();
            saveWidgetData();
        };

        var sortCollectionByPosition = function() {
            collectionData.collections.sort(function(a, b) {
                var positionA = a.position;
                var positionB = b.position;
                if (positionA && positionB) {
                    return positionA - positionB;
                } else if (positionA) {
                    return -1;
                } else if (positionB) {
                    return 1;
                } else {
                    return 0;
                }
            });
        };

        var parseState = function() {
            if (removedEverything) {
                removedEverything = false;
                return;
            }
            var collection = $.bbq.getState("collection");
            var mode = $.bbq.getState("mode");
            var pos = $.bbq.getState("pos");
            var category = $.bbq.getState("category");
            var item = $.bbq.getState("item");
            var fromShow = $.bbq.getState("fromShow");
            var view = "mapView";
            if (item) {
                hideEverything();
                selectedCollectionID = collection;
                setCollectionData();
                selectedItemID = item;
                if (mode === "edit") {
                    editContent(item);
                } else {
                    showContentItem();
                }
              } else if (collection) {
                hideEverything();
                selectedCollectionID = collection;
                setCollectionData();
                if (mode === "edit") {
                    editRoom(collection, fromShow, pos);
                } else {
                    showRoom();
                }
              } else {
                hideEverything();
                renderMapView();
                if (mode === "edit") {
                    if (!$("#collections_header div", $rootel).hasClass("expanded")) {
                        $("#collections_header div a#configure_widget", $rootel).trigger("click");
                    }
                }
            }

            if (sakai_global.show.canEdit()) {
                $(".configure", $rootel).show();
            }
            renderGlobals();
            if (firstRender) {
                firstRender = false;
            }
        };

        var deleteItem = function(itemID) {
            var newCategoryItemData = [];
            for (var i = 0; i < currentCategoryData.items.length; i++) {
                if (currentCategoryData.items[i].id != itemID) {
                    newCategoryItemData.push(currentCategoryData.items[i]);
                }
            }
            currentItemData = {};
            currentCategoryData.items = newCategoryItemData;
            saveCategoryData();
        };

        var deleteCategory = function(cid) {
            var newCollectionData = [];
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                if (currentCollectionData.categories[i].id != cid) {
                    newCollectionData.push(currentCollectionData.categories[i]);
                }
            }
            currentCategoryData = {};
            currentCollectionData.categories = newCollectionData;
            saveWidgetData();
        };

        var deleteCollection = function(cid) {
            var newCollectionData = [];
            for (var i = 0; i < collectionData.collections.length; i++) {
                if (collectionData.collections[i].id != cid) {
                    newCollectionData.push(collectionData.collections[i]);
                }
            }
            currentCollectionData = {};
            collectionData.collections = newCollectionData;
            saveWidgetData();
        };

        var setCollectionData = function() {
            if (!currentCollectionData || !currentCollectionData.categories || currentCollectionData.categories.length === 0) {
                for (var i in collectionData.collections) {
                    if (collectionData.collections[i].id == selectedCollectionID) {
                        currentCollectionData = collectionData.collections[i];
                        break;
                    }
                }
            }
        };

        var hideEverything = function() {
            try {
                tinyMCE.execCommand('mceRemoveControl', false, 'arch_room_overview');
                tinyMCE.execCommand('mceRemoveControl', false, 'arch_content_description');
            } catch(e) {}
            $(".mapView", $rootel).hide();
            $(".albumView", $rootel).hide();
        };

        var renderGlobals = function() {
            if (sakai_global.show.canEdit() && firstRender) {
                $("#collections_header div", $rootel).show();
                if (!$("#collections_header div", $rootel).hasClass("expanded")) {
                    $("#collections_header div a#configure_widget", $rootel).trigger("click");
                }
            }
        };

        /**
         * New TinyMCE Functions
         */
        var initInlineMCE = function() {
            tinyMCE.init({
                mode: "none",
                theme: "simple",
                width: "589px",
                content_css: '/devwidgets/collections/css/collections.css'
            });
        };

        /**
         * Universal event bindings
         */

        $("#collections_header h1", $rootel).die("click");
        $("#collections_header h1", $rootel).live("click", function() {
            if (!$(this).hasClass("editable")) {
                $.bbq.removeState('item', 'category', 'collection', 'fromShow', 'mode', 'pos');
            }
        });

        $("#collections_header div a#configure_widget", $rootel).die("click");
        $("#collections_header div a#configure_widget", $rootel).live("click", function() {
            // $("#collections_header div", $rootel).toggleClass("expanded");
            // $("#collections_header div span#choose_layout", $rootel).toggle();
            if (sakai_global.show.canEdit()) {
                toggleTitleEditable();
            }
        });

        $("#collections_header div span#choose_layout", $rootel).die("click");
        $("#collections_header div span#choose_layout", $rootel).live("click", function() {
            $("#collections_header_select_layout", $rootel).toggle();
        });

        var thisPage = $(".jstree-clicked").text();
        $("#navigation_tree").bind("select_node.jstree", function() {
            if ($.trim(thisPage) === "") {
                thisPage = $(".jstree-clicked").text();
            }
            if (thisPage !== $(".jstree-clicked").text()) {
                try {
                    tinyMCE.execCommand('mceRemoveControl', false, 'arch_room_overview');
                    tinyMCE.execCommand('mceRemoveControl', false, 'arch_content_description');
                } catch(e) {}
                $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");
            }
        });


        // History Mgmt
        $(window).unbind("hashchange." + rootel);
        $(window).bind("hashchange." + rootel, function() {
            if ($rootel.is(":visible")) {
                parseState();
            }
        });


        // Hide the layout dropdown if anywhere else is clicked
        $(document).unbind("click." + rootel);
        $(document).bind("click." + rootel, function(e) {
            if ($rootel.is(":visible")) {
                if ($("#collections_header_select_layout", $rootel).is(":visible")) {
                    var $clicked = $(e.target);
                    if (!$clicked.parents().is("#collections_header_select_layout", $rootel) && !$clicked.parents().is("#choose_layout") && !$clicked.is("#choose_layout") && !$clicked.is("#collections_header_select_layout")) {
                        $("#collections_header_select_layout", $rootel).toggle();
                    }
                }
            }
        });

        var toggleTitleEditable = function() {
            if (!$("#collections_header h1.isEditable", $rootel).hasClass("editable")) {
                $("#collections_header h1.isEditable", $rootel).editable(function(value, _settings) {
                    settings.widgetTitle = value;
                    saveWidgetData();
                    return (value);
                },
                {
                    type: 'text',
                    submit: 'OK',
                    tooltip: 'Click to change title',
                    cssclass: 'inlineEditBtn'
                });
                $("#collections_header h1.isEditable", $rootel).addClass("editable");
            } else {
                $("#collections_header h1.isEditable", $rootel).editable("destroy");
                $("#collections_header h1.isEditable", $rootel).removeClass("editable");
                $("#collections_header h1.isEditable", $rootel).attr("title", "");
            }

        };

        /**
         * Album View Events
         */

        $(".addItem", $rootel).die("click");
        $(".addItem", $rootel).live("click", function() {
            addNewItem();
        });

        $(".categoryHeader span a", $rootel).die("click");
        $(".categoryHeader span a", $rootel).live("click", function() {
            addNewCategory();
        });

        $(".configureCategory button", $rootel).die("click");
        $(".configureCategory button", $rootel).live("click", function() {
            deleteCategory(currentCategoryData.id);
            $.bbq.removeState("category", "fromShow", "pos", "mode");
        });

        $(".configureAlbum button", $rootel).die("click");
        $(".configureAlbum button", $rootel).live("click", function() {
            deleteCollection(currentCollectionData.id);
            $.bbq.removeState("collection", "fromShow", "pos", "mode");
        });

        $(".configureItem button", $rootel).die("click");
        $(".configureItem button", $rootel).live("click", function() {
            deleteItem(currentItemData.id);
            $.bbq.removeState("item", "fromShow", "pos", "mode");
        });

        $(".configureAlbum a", $rootel).die("click");
        $(".configureAlbum a", $rootel).live("click", function() {
            $(".configureAlbum").toggleClass("expanded");
            $(".configureAlbum button").toggle();
            $(".categoryHeader span").toggle();
            toggleAlbumEditable();
        });

        $(".configureCategory a", $rootel).die("click");
        $(".configureCategory a", $rootel).live("click", function() {
            $(".configureCategory").toggleClass("expanded");
            $(".configureCategory button").toggle();
            toggleCategoryEditable();
            return false;
        });

        $(".configureItem a", $rootel).die("click");
        $(".configureItem a", $rootel).live("click", function() {
            $(".configureItem").toggleClass("expanded");
            $(".configureItem button").toggle();
            toggleItemEditable();
            return false;
        });

        $("#collections_albums_show_category h1", $rootel).die("click");
        $("#collections_albums_show_category h1", $rootel).live("click", function() {
            $.bbq.removeState('item', 'category', "fromShow", "pos", "mode");
        });

        $(".scroll-content-item", $rootel).die("mouseenter");
        $(".scroll-content-item", $rootel).live("mouseenter", function() {
            if (clickedItemID == -1) {
                $(this).addClass("hovered");
            }
            if ($(this).attr("id").split("item_")[1] == clickedItemID) {
                $(this).addClass("clicked");
            }
        });

        $(".scroll-content-item", $rootel).die("mouseleave");
        $(".scroll-content-item", $rootel).live("mouseleave", function() {
            $(this).removeClass("hovered");
            $(this).removeClass("clicked");
        });

        $(".scroll-content-item", $rootel).die("mousedown");
        $(".scroll-content-item", $rootel).live("mousedown", function() {
            $(this).addClass("clicked");
            clickedItemID = $(this).attr("id").split("item_")[1];
        });

        $(".scroll-content-item", $rootel).die("mouseup");
        $(".scroll-content-item", $rootel).live("mouseup", function() {
          $(this).removeClass("clicked");
            var itemid = $(this).attr("id").split("item_")[1];
              if (itemid == clickedItemID) {
                $(".scroll-content-item").removeClass("selected");
                $(this).addClass("selected");
                selectedItemID = itemid;
                clickedItemID = -1;
                $.bbq.pushState({
                    "item": selectedItemID
                });
            }
        });

        var timeOfLastImageChange = 0;

        $(".categoryPreview div img", $rootel).die("mousemove");
        $(".categoryPreview div img", $rootel).live("mousemove", function(e) {
            var catid = $(this).parents(".categoryPreview").attr("id").split("category_")[1];
            if (categoryImages[catid]) {
                // if there are any images at all here
                var d = new Date();
                var currentTime = d.getTime();
                if (currentTime - timeOfLastImageChange > 100) {
                    // throttle it so its not crazy
                    timeOfLastImageChange = currentTime;
                    if (categoryImages[catid].currentImage + 1 >= categoryImages[catid].images.length) {
                        categoryImages[catid].currentImage = 0;
                    } else {
                        categoryImages[catid].currentImage++;
                    }
                    $(this).attr("src", categoryImages[catid].images[categoryImages[catid].currentImage]);
                }
            }
        });

        $(".categoryPreview", $rootel).die("mouseup");
        $(".categoryPreview", $rootel).live("mouseup", function() {
          $(this).removeClass("clicked");
          var catid = $(this).attr("id").split("category_")[1];
            if (catid == clickedCategoryID) {
              selectedCategoryID = catid;
              clickedCategoryID = -1;
              $.bbq.pushState({
                  "category": selectedCategoryID
              });
          }
        });

        $(".categoryPreview", $rootel).die("mouseenter");
        $(".categoryPreview", $rootel).live("mouseenter", function() {
            if (clickedCategoryID == -1) {
                $(this).addClass("hovered");
            }
            if ($(this).attr("id").split("category_")[1] == clickedCategoryID) {
                $(this).addClass("clicked");
            }
        });

        $(".categoryPreview", $rootel).die("mouseleave");
        $(".categoryPreview", $rootel).live("mouseleave", function() {
          $(this).removeClass("clicked");
          $(this).removeClass("hovered");
        });

        $(".categoryPreview", $rootel).die("mousedown");
        $(".categoryPreview", $rootel).live("mousedown", function() {
          $(this).addClass("clicked");
          clickedCategoryID = $(this).attr("id").split("category_")[1];
        });

        $(".albumCover", $rootel).die("mousedown");
        $(".albumCover", $rootel).live("mousedown", function() {
            $(this).addClass("clicked");
            clickedCollectionID = $(this).attr("id").split("_")[1];
        });

        $(".albumCover", $rootel).die("mouseleave");
        $(".albumCover", $rootel).live("mouseleave", function() {
          $(this).removeClass("clicked");
          $(this).removeClass("hovered");
        });

        $(".albumCover", $rootel).die("mouseenter");
        $(".albumCover", $rootel).live("mouseenter", function() {
          if (clickedCollectionID == -1) {
            $(this).addClass("hovered");
        }
            if ($(this).attr("id").split("_")[1] == clickedCollectionID) {
                $(this).addClass("clicked");
            }
        });

        $(".albumCover", $rootel).die("mouseup");
        $(".albumCover", $rootel).live("mouseup", function() {
            $(this).removeClass("clicked");
            if ($(this).attr("id").split("_")[1] == clickedCollectionID) {
                if ($(this).hasClass("addAlbum")) {
                    addNewAlbum();
                } else {
                    selectedCollectionID = clickedCollectionID;
                    clickedCollectionID = -1;
                    $.bbq.pushState({
                        'collection': selectedCollectionID
                    });
                }
            }
        });

        $(document).bind("mouseup", function(e) {
            if ($(e.target).attr("id")) {
                if ($(e.target).attr("id").split("_")[0] != "album") {
                    clickedCollectionID = -1;
                }
                if ($(e.target).attr("id").split("_")[0] != "category") {
                  clickedCategoryID = -1;
                }
                if ($(e.target).attr("id").split("_")[0] != "item") {
                  clickedItemID = -1;
                }
            }
        });

        /**
         * Map View
         */

        var prepCollectionDataForMapView = function() {
            var ret = {
                "collections": []
            };

            sortCollectionByPosition();

            for (var i = 1; i < 11; i++) {
                var tmpToPush = {};
                for (var j in collectionData.collections) {
                    if (collectionData.collections.hasOwnProperty(j)) {
                        if (collectionData.collections[j].position == i) {
                            tmpToPush = collectionData.collections[j];
                        }
                    }
                }

                if (!tmpToPush.position) {
                    if (collectionData.collections[i - 1] && !collectionData.collections[i - 1].position) {
                        tmpToPush = collectionData.collections[i - 1];
                    }
                    tmpToPush.position = i;
                }

                if (!tmpToPush.id) {
                    var d = new Date();
                    tmpToPush.id = d.getTime() + "" + Math.floor(Math.random() * 101);
                }

                ret.collections.push(tmpToPush);
            }

            return ret;
        };

        var renderMapView = function() {
            $collections_map.show();
            var mapViewData = prepCollectionDataForMapView();
            mapViewData.sakai = sakai;
            sakai.api.Util.TemplateRenderer(collectionsMapTemplate, mapViewData, $collections_map);
            if (sakai_global.show.canEdit()) {
              $("#collections_header div", $rootel).show();
            } else {
                $("span a.addLink", $rootel).hide();
            }
        };

        var editRoom = function(id, fromShowRoom, roomPosition) {
            selectedCollectionID = id;
            var roomExists = false;
            for (var i = 0; i < collectionData.collections.length; i++) {
                if (collectionData.collections[i].id == selectedCollectionID) {
                    currentCollectionData = collectionData.collections[i];
                    roomExists = true;
                }
            }

            if (!roomExists) {
                currentCollectionData = {
                    "position": roomPosition,
                    "categories": []
                };
            }

            hideEverything();
            $collections_map_room_edit_container.show();
            $collections_map_room_edit_container.parent().show();

            if (fromShowRoom === "true") {
                fromViewRoom = true;
                $collectionsReturnToFloorplanFromEdit.hide();
                $collectionsReturnToRoomFromEdit.show();
            } else {
                fromViewRoom = false;
                $collectionsReturnToFloorplanFromEdit.show();
                $collectionsReturnToRoomFromEdit.hide();
            }
            if (!currentCollectionData.id) {
                var d = new Date();
                currentCollectionData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
            }
            $collections_map_room_edit = $($collections_map_room_edit.selector);
            $collections_map_room_edit.html(sakai.api.Util.TemplateRenderer(collectionsEditRoomTemplate, {"room": currentCollectionData, sakai: sakai}));
            $categories_listing_body = $($categories_listing_body.selector);
            if (currentCollectionData.categories) {
                var catHTML = sakai.api.Util.TemplateRenderer(categoriesListingBodyTemplate, {"categories": currentCollectionData.categories, sakai: sakai});
                $categories_listing_body.html(catHTML);
                sortCategoriesDisplay();
            }            
            tinyMCE.execCommand('mceAddControl', true, 'arch_room_overview');
        };

        var getRoom = function(id) {
            var thisCollectionData;
            // Get the room's data
            for (var i = 0; i < collectionData.collections.length; i++) {
                if (collectionData.collections[i].id == id) {
                    thisCollectionData = collectionData.collections[i];
                }
            }
            return thisCollectionData;
        };

        var showRoom = function() {
            currentCollectionData = getRoom(selectedCollectionID);
            hideEverything();
            $collections_map_show_room_conatiner.show();
            currentCollectionData.categories.sort(function(a,b){
                return a.position - b.position;
            });
            sakai.api.Util.TemplateRenderer(collectionsShowRoomTemplate, {"room": currentCollectionData, sakai: sakai }, $collections_map_show_room);
            if (!sakai_global.show.canEdit()) {
                $("span#room_edit_links", $rootel).hide();
            }
        };

        var returnToFloorplan = function() {
            $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");
        };

        var editContent = function(contentItemID) {
            hideEverything();
            currentContentItemData = {};
            var currentItemCategory = "";
            $collections_map_add_content_container.show();
            if (contentItemID !== 0) {
                for (var i = 0; i < currentCollectionData.categories.length; i++) {
                    var currentCat = currentCollectionData.categories[i];
                    for (var j = 0; j < currentCat.items.length; j++) {
                        if (currentCat.items[j] && currentCat.items[j].id == contentItemID) {
                            currentItemCategory = currentCat.name;
                            currentContentItemData = currentCat.items[j];
                        }
                    }
                }
            }

            sakai.api.Util.TemplateRenderer(collectionsAddContentTemplate, {"content": currentContentItemData, sakai:sakai }, $collections_map_add_content);
            $category_dropdown = $($category_dropdown.selector);
            sakai.api.Util.TemplateRenderer(collectionsCategoryDropdownTemplate, {"room": currentCollectionData, "currentCat": currentItemCategory, sakai:sakai}, $category_dropdown);

            if (contentItemID !== 0 && contentItemID !== "0") {
                $collectionsReturnToContentFromEditLink.show();
                $collectionsReturnToRoomFromEdit.hide();
            } else {
                $collectionsReturnToContentFromEditLink.hide();
                $collectionsReturnToRoomFromEdit.show();
            }
            tinyMCE.execCommand('mceAddControl', true, 'arch_content_description');

        };

        var showContentItem = function() {
            currentContentItemData = {};
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                for (j = 0; j < currentCollectionData.categories[i].items.length; j++) {
                    if (currentCollectionData.categories[i].items[j] && currentCollectionData.categories[i].items[j].id == selectedItemID) {
                        currentContentItemData = currentCollectionData.categories[i].items[j];
                    }
                }
            }
            $collections_map_show_content_item_container.show();
            sakai.api.Util.TemplateRenderer(collectionsShowContentItemTemplate, {"item": currentContentItemData, sakai:sakai}, $collections_map_show_content_item);
        };

        /**
         * Edit the collectionData object to get ready for a POST
         */

        var saveCurrentContentData = function() {
            var isNew = true;
            if (currentContentItemData.id) {
                isNew = false;
                var curID = currentContentItemData.id;
                selectedItemID = curID;
            }
            currentContentItemData.title = $("#content_title", $rootel).val();
            currentContentItemData.url = $("#content_url", $rootel).val();
            currentContentItemData.description = tinyMCE.get("arch_content_description").getContent();
            currentContentItemData.mimeType = $("#content_mimetype", $rootel).val();
            var selectedCat = $("#category_dropdown select option:selected", $rootel).val();
            var changedCat = true;
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                if (currentCollectionData.categories[i].name == selectedCat) {
                    if (!isNew) {
                        // replace current one
                        for (var j = 0; j < currentCollectionData.categories[i].items.length; j++) {
                            if (currentCollectionData.categories[i].items[j] && currentCollectionData.categories[i].items[j].id == currentContentItemData.id) {
                                currentCollectionData.categories[i].items[j] = currentContentItemData;
                                changedCat = false;
                            }
                        }
                    } else {
                        // just add it in
                        var d = new Date();
                        currentContentItemData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
                        currentCollectionData.categories[i].items.push(currentContentItemData);
                        selectedItemID = currentContentItemData.id;
                    }
                }
            }
            if (changedCat && !isNew) {
                for (var x = 0; x < currentCollectionData.categories.length; x++) {
                    if (currentCollectionData.categories[x].name !== selectedCat) {
                        for (var z = 0; z < currentCollectionData.categories[x].items.length; z++) {
                            if (currentCollectionData.categories[x].items[z] && currentCollectionData.categories[x].items[z].id == currentContentItemData.id) {
                                delete currentCollectionData.categories[x].items[z];
                            }
                        }
                    } else {
                        currentCollectionData.categories[x].items.push(currentContentItemData);
                    }
                }
            }
        };

        /**
         * Map View - Room Image Methods
         */
        var addRoomImage = function(url) {
            $("#room_image", $rootel).val(url);
        };

        var addItemContent = function(url) {
            $("#content_url", $rootel).val(url);
        };

        var addContentMimetype = function(mt) {
            $("#content_mimetype", $rootel).val(mt);
        };

        /**
         * Map View - Category Methods
         */
        var deleteCategories = function(catIDs) {
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                for (var j = 0; j < catIDs.length; j++) {
                    if (currentCollectionData.categories[i].id == catIDs[j]) {
                        currentCollectionData.categories.splice(i, 1);
                        $("#cat_" + catIDs[j], $rootel).parent().parent().fadeOut().remove();
                    }
                }
            }
            var catOrders = $("#categories_listing_body input[type='text']:visible", $rootel);
            catOrders.each(function(index, elt) {
                index = index+1;
                if (index !== $(elt).val()) {
                    $(elt).val(index);
                }
            });
        };

        var updateCategoryOrder = function() {
            var catOrders = $("#categories_listing_body input[type='text']", $rootel);
            // make sure there aren't any dups
            var orders = [];
            catOrders.each(function(index, elt) {
                if ($.inArray($(elt).val(), orders) == -1) {
                    orders.push($(elt).val());
                } else {
                    // duplicate, do something better than this
                    alert('duplicate order, try again');
                    return;
                }
            });

            // sort them by order
            catOrders.sort(function(a, b) {
                var positionA = $(a).val();
                var positionB = $(b).val();
                return positionA - positionB;
            });

            // update order in currentCollectionData
            for (var j = 0; j < catOrders.length; j++) {
                var catID = $(catOrders[j]).attr("name");
                var catPos = $(catOrders[j]).val();
                for (var i = 0; i < currentCollectionData.categories.length; i++) {
                    if (currentCollectionData.categories[i].id == catID) {
                        currentCollectionData.categories[i].position = j + 1;
                        $("input[name='" + catID + "']", $rootel).val(j + 1);
                    }
                }
            }
            sortCategoriesDisplay();
        };

        var sortCategoriesDisplay = function() {
            var rows = $("#categories_listing_body tr", $rootel);
            rows.sort(function(a, b) {
                var positionA = $(a).find("input[type='text']").val();
                var positionB = $(b).find("input[type='text']").val();
                return positionA - positionB;
            });
            $("#categories_listing_body", $rootel).html('');
            $(rows).each(function(index, elt) {
                $("#categories_listing_body", $rootel).append(elt);
            });
        };

        var addCategory = function(catToAdd) {
            var newCategory;
            var canAdd = true;
            $categories_listing_body = $($categories_listing_body.selector);
            if (currentCollectionData.categories) {
                for (var j = 0; j < currentCollectionData.categories.length; j++) {
                    if (currentCollectionData.categories[j].name == catToAdd) {
                        canAdd = false;
                    }
                }
            }
            if (canAdd) {
                var d = new Date();
                var catID = d.getTime() + "" + Math.floor(Math.random() * 101);
                newCategory = {
                    "name": catToAdd,
                    "id": catID,
                    "position": currentCollectionData.categories ? currentCollectionData.categories.length + 1 : 1,
                    "items": []
                };
                var currentNumCategories = currentCollectionData.categories ? currentCollectionData.categories.length : 0;
                if (currentNumCategories === 0) {
                    currentCollectionData.categories = [];
                    $categories_listing_body.html(sakai.api.Util.TemplateRenderer(categoriesListingBodyTemplate, {
                        "categories": [newCategory],
                        sakai: sakai
                    }));
                } else {
                    $categories_listing_body.append(sakai.api.Util.TemplateRenderer(categoriesListingBodyTemplate, {
                        "categories": [newCategory],
                        sakai: sakai
                    }));
                }
                currentCollectionData.categories.push(newCategory);
                $("#add_category", $rootel).val('');
            } else {
                // name conflict, cannot add
                alert('There already exists a category named "' + catToAdd + '". Please rename your category and try adding again.');
            }
        };

        /**
         * Map View - Event Bindings
         */

        $addCategoryButton.die("click");
        $addCategoryButton.live("click", function() {
            var catToAdd = $.trim($("#add_category", $rootel).val());
            if (catToAdd !== "") {
                addCategory(catToAdd);
            } /*else {
                // do nothing, for now
            }*/
            return false;
        });

        $(".roomLink", $rootel).die("click");
        $(".roomLink", $rootel).live("click", function() {
          var roomID = $(this).parents(".roomWrapper").attr("id").split("_")[1];
            if ($(this).hasClass("addLink")) {
                var editRoomPos =  $(this).attr("id").split("_")[1];
                $.bbq.pushState({"collection": roomID, "mode": "edit", "fromShow": false, "pos": editRoomPos});
            } else {
              $.bbq.pushState({"collection": roomID});
            }
            return false;
        });

        $("#save_add_content").die("click");
        $("#save_add_content").live("click", function(e) {
            if (sakai_global.show.canEdit() && e.pageX !== 0) {
                if ($.trim($("#content_title", $rootel).val()) !== "") {
                    saveCurrentContentData();
                    saveCollectionData();
                    $.bbq.removeState("fromShow", "pos", "mode");
                    $.bbq.pushState({"item": selectedItemID});                
                } else {
                    alert("You must add a title to save this content");
                }
            }
            return false;
        });

        $collectionsAddContentForm.die("submit");
        $collectionsAddContentForm.live("submit", function(e) {
            return false;
        });

        $("#save_room", $rootel).die("click");
        $("#save_room", $rootel).live("click", function(e) {
            if (sakai_global.show.canEdit() && e.pageX !== 0) {
                if ($.trim($("#room_title", $rootel).val()) === "") {
                    // need a title, son!
                    alert("Please enter a title for this room before saving.");
                    return false;
                }
                currentCollectionData.title = $("#room_title", $rootel).val();
                currentCollectionData.image = $("#room_image", $rootel).val();
                currentCollectionData.description = tinyMCE.get("arch_room_overview").getContent();
                currentCollectionData.id = $.bbq.getState("collection");
                saveCollectionData();
                $.bbq.removeState("fromShow", "pos", "mode");
            }
            return false;
        });

        $collectionsEditForm.die("submit");
        $collectionsEditForm.live("submit", function(e) {
            return false;
        });

        $collectionsReturnToFloorplanFromShow.die("click");
        $collectionsReturnToFloorplanFromShow.live("click", function() {
            $.bbq.removeState("collection", "item", "fromShow", "pos", "mode", "item");
            return false;
        });

        $collectionsReturnToFloorplanFromEdit.die("click");
        $collectionsReturnToFloorplanFromEdit.live("click", function() {
            $.bbq.removeState("item", "collection", "fromShow", "pos", "mode", "item");
            return false;
        });

        $collectionsSettingsSubmit.die("click");
        $collectionsSettingsSubmit.live("click", function() {
            saveWidgetSettings();
            return false;
        });

        $collectionsSettingsCancel.die("click");
        $collectionsSettingsCancel.live("click", function() {
            sakai.api.Widgets.Container.informCancel(tuid, "collections");
            return false;
        });

        $("#cancel_edit_room", $rootel).die("click");
        $("#cancel_edit_room", $rootel).live("click", function(e) {
            if (e.pageX !== 0) {
                hideEverything();
                if (fromViewRoom) {
                    showRoom();
                } else {
                    $collections_map.show();
                }
            }
            return false;
        });

        $("#cancel_add_content", $rootel).die("click");
        $("#cancel_add_content", $rootel).live("click", function(e) {
            if ($.bbq.getState("item") === "0") {
                hideEverything();
                $.bbq.removeState("mode", "item");
            } else {
                $.bbq.removeState("mode");
            }
            return false;
        });

        $("#delete_categories", $rootel).die("click");
        $("#delete_categories", $rootel).live("click", function() {
            var categoriesToDelete = $("#categories_listing_body input[type='checkbox']:checked", $rootel);
            var catIDsToDelete = [];
            $(categoriesToDelete).each(function(index, cat) {
                catIDsToDelete.push($(cat).val());
            });
            deleteCategories(catIDsToDelete);
            return false;
        });

        $("#update_order", $rootel).die("click");
        $("#update_order", $rootel).live("click", function() {
            updateCategoryOrder();
            return false;
        });

        $(collectionsRoomCategoryItem, $rootel).die("click");
        $(collectionsRoomCategoryItem, $rootel).live("click", function() {
            var catItemID = $(this).attr('id').split("item_")[1];
            // show category item
        });

        $collectionsReturnToRoomFromEdit.die("click");
        $collectionsReturnToRoomFromEdit.live("click", function() {
            $.bbq.removeState("fromShow", "pos", "mode", "item");
            return false;
        });

        $collectionsReturnToRoomFromEditContentItem.die("click");
        $collectionsReturnToRoomFromEditContentItem.live("click", function() {
            $.bbq.removeState("item", "fromShow", "pos", "mode", "item");
            return false;
        });

        $(collectionsEditRoomLink, $rootel).die("click");
        $(collectionsEditRoomLink, $rootel).live("click", function() {
            if (sakai_global.show.canEdit()) {
                $.bbq.pushState({"mode": "edit", "fromShow": true, "collection": selectedCollectionID});
            }
            return false;
        });

        $(collectionsEditContentLink, $rootel).die("click");
        $(collectionsEditContentLink, $rootel).live("click", function() {
            if (sakai_global.show.canEdit()) {
                $.bbq.pushState({"mode": "edit", "item": selectedItemID});
            }
            return false;
        });

        $(collectionsAddContentLink, $rootel).die("click");
        $(collectionsAddContentLink, $rootel).live("click", function() {
            // show add content pane
            if (sakai_global.show.canEdit()) {
                $.bbq.pushState({"mode": "edit", "item": 0});
            }
            return false;
        });

        $(collectionsViewContentLink, $rootel).die("click");
        $(collectionsViewContentLink, $rootel).live("click", function() {
            var id = $(this).attr("id").split("cat_")[1];
            var itemID = id.split("_item_")[1];
            $.bbq.pushState({"item":itemID});
            return false;
        });

        $collectionsReturnToContentFromEditLink.die("click");
        $collectionsReturnToContentFromEditLink.live("click", function() {
            $.bbq.removeState("mode");
            return false;
        });

        var resetState = function() {
            removedEverything = true;
            try {
                tinyMCE.execCommand('mceRemoveControl', false, 'arch_room_overview');
                tinyMCE.execCommand('mceRemoveControl', false, 'arch_content_description');
            } catch(e) {}
            $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");            
        };

        $("#edit_page, #delete_confirm, #createpage_save").die("click", resetState);
        $("#edit_page, #delete_confirm, #createpage_save").live("click", resetState);

        $("button.s3d-button.s3d-button-primary.save_button", $rootel).die("click");
        $("button.s3d-button.s3d-button-primary.save_button", $rootel).live("click", function() {
            hideEverything();
            $collections_map.show();
            return false;
        });

        $("button.s3d-button.cancel-button", $rootel).die("click");
        $("button.s3d-button.cancel-button", $rootel).live("click", function() {
            hideEverything();
            $collections_map.show();
            return false;
        });


        // embed content bindings

        var bindToContentPicker = function() {
            $(".itemImage.editable", $rootel).die("click");
            $(".itemImage.editable", $rootel).live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Item", "mode": "picker", "limit": 1, "filter": false});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addItemFile(fileList.items[0].link, fileList.items[0].mimetype);
                    }
                });
                return false;
            });
            $(".albumImage.editable", $rootel).die("click");
            $(".albumImage.editable", $rootel).live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Album", "mode": "picker", "limit": 1, "filter": "image"});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addAlbumImage(fileList.items[0].link);
                    }
                });
                return false;
            });
            $browseForFilesButton.die("click");
            $browseForFilesButton.live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Album", "mode": "picker", "limit": 1, "filter": "image"});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addRoomImage(fileList.items[0].link);
                    }
                });
                return false;
            });
            $browseForContentFileButton.die("click");
            $browseForContentFileButton.live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Album", "mode": "picker", "limit": 1, "filter": false});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addItemContent(fileList.items[0].link);
                        addContentMimetype(fileList.items[0].mimetype);
                    }
                });
                return false;
            });
        };

        /**
         * Startup
         */
        var doInit = function() {
            getWidgetData();
            initInlineMCE();
            if (showSettings) {
                $collections_settings.show();
                $collections_main_container.hide();
            } else {
                $collections_settings.hide();
                $collections_main_container.show();
            }
            if (sakai.contentpicker) {
                bindToContentPicker();
            } else {
                $(window).bind("ready.contentpicker.sakai", function(e) {
                    bindToContentPicker();
                });
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            }
        };
        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("collectionsarchview");
});
