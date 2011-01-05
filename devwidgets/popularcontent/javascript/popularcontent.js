/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.popularcontent
 *
 * @class popularcontent
 *
 * @description
 * Initialize the popularcontent widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.popularcontent = function(tuid, showSettings) {

    var $rootel = $("#"+tuid),
        $popularcontent_main = $("#popularcontent_main", $rootel),
        $popularcontent_main_template = $("#popularcontent_main_template", $rootel);

    var contentData = {};

    var renderPopularContent = function(){
        $popularcontent_main.html($.TemplateRenderer($popularcontent_main_template, {
            data: contentData
        })).show();
    };
    
    $(window).bind("sakai-directory-selected", function(ev, selected){
        loadDataDirectory(selected, renderPopularContent);
    });
    
    var loadDataDirectory = function(selected, callback){
        var params = {
            page: 0,
            items: 10,
            q: selected,
            sortOrder: "descending"
        };

        $.ajax({
        	url: sakai.config.URL.SEARCH_ALL_FILES,
            data: params,
            success: function(data){
                contentData = {"results":[], "items": data.items, "total": data.total};
                var content = [];
                for (var i = 0; i < data.results.length; i++){
                    var item = {};
                    item["id"] = data.results[i]["jcr:name"];
                    item["name"] = data.results[i]["sakai:pooled-content-file-name"];
                    content.push(item);
                }
                contentData.results[0] = {"content": content};
                contentData.moreLink = "/dev/search_content.html#tag=/tags/directory/" + selected;
                callback();
            }
        });
    };

    var loadData = function(callback){
        $.ajax({
        	url: "/var/search/public/mostactivecontent.json?page=0&items=5",
            cache: false,
            success: function(data){
            	contentData = data;
                callback();
            }
        });
    };

    var doInit = function(){
        if (! sakai.api.Widgets.isOnDashboard(tuid)){
            $(".popularcontent-widget-border").show();
            $("#popularcontent_widget").addClass("fl-widget s3d-widget");
        }

        // If the widget is initialized on the directory page then listen to the event to catch specified tag results
        if (!(sakai.directory2 && sakai.directory2.getIsDirectory())) {
           loadData(renderPopularContent);
        }
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("popularcontent");
