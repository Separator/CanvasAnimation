/**
 * Created with JetBrains WebStorm.
 * User: Максим
 * Date: 08.07.14
 * Time: 21:14
 * To change this template use File | Settings | File Templates.
 * Required: jquery, underscore
 */

function Assets(options) {
    var defaultSettings = {
        "animationsDir":            "assets",
        "unitsDir":                 "assets/units",
        "assetsCatalog":            "catalog.json",
        "assetDescription":         "description.json",
        "ajax":                 {
            "async":    false,
            "cache":    false,
            "dataType": "json",
            "type":     "POST"
        },

        "animationsList":           null,
        "animationsListFinished":   null,
        "imagesList":               null,
        "animationsLoaded":         function (animations) {},

        "unitsList":                null,
        "unitsLoaded":              function (units) {}
    };

    /**
     * Получение анимации
     * @param dir
     * @param catalog
     * @return {Boolean}
     */
    this.animationLoad = function(dir, catalog) {
        var filePath = dir + '/' + catalog;
        var result   = false;
        $.ajax(
            $.extend(
                true,
                _.clone(this['ajax']),
                {
                    "context":  this,
                    "url":      filePath,
                    "success":  function(data) {
                        var that = this;
                        // получаем список анимаций:
                        var animationsList = data['assets'];
                        // вытаскиваем детальную информацию:
                        var assets ={};
                        for (var i = 0; i < animationsList.length; i++) {
                            var path = dir + '/' + animationsList[i] + '/' + this['assetDescription'];
                            $.ajax(
                                $.extend(
                                    true,
                                    _.clone(this['ajax']),
                                    {
                                        "url":  path,
                                        "success": function(data) {
                                            assets[animationsList[i]] = data;
                                        }
                                    }
                                )
                            );
                        };
                        if (_.size(assets)) {
                            // дополняем список активов:
                            if (this['animationsList']) {
                                $.extend(true, this['animationsList'], assets);
                            } else {
                                this['animationsList'] = assets;
                            };
                            // начинаем загрузку изображений:
                            var imagesList  = this['imagesList'] || {};
                            var imagesCount = 0;
                            var loadedImagesCount = 0;
                            // считаем кол-во изображений для загрузки:
                            for (var assetName in assets) {
                                for (var animationName in assets[assetName]) {
                                    imagesCount += assets[assetName][animationName]["frames"].length;
                                };
                            };
                            // подгружаем изображения:
                            for (var assetName in assets) {
                                if (!(assetName in imagesList)) {
                                    imagesList[assetName] = {};
                                };
                                var asset = assets[assetName];
                                // вытаскиваем имена файлов изображений:
                                for (var animationName in asset) {
                                    var frames = asset[animationName]["frames"];
                                    for (var i = 0; i < frames.length; i++) {
                                        var imgName = frames[i]["i"];
                                        imagesList[assetName][imgName] = new Image();
                                        imagesList[assetName][imgName].onload = function() {
                                            loadedImagesCount++;
                                            if (loadedImagesCount == imagesCount) {
                                                if (!that['imagesList']) {
                                                    that['imagesList'] = imagesList;
                                                };
                                                that.animationProcess();
                                                if (that['animationsLoaded']) {
                                                    that['animationsLoaded'](that['animationsListFinished']);
                                                };
                                            };
                                        };
                                        imagesList[assetName][imgName].src=this['animationsDir']+'/'+assetName+'/images/'+imgName;
                                    };
                                };
                            };
                            result = true;
                        } else {
                            result = false;
                        };
                    }
                }
            )
        );
        return result;
    };
    /**
     * Обработка полученных активов
     * @param animationsList
     * @return {*}
     */
    this.animationProcess = function(animationsList) {
        animationsList = animationsList || this['animationsList'];
        if (!animationsList) {
            return false;
        };
        var result = {};
        for (var asset in animationsList) {
            result[asset] = {};
            for (var animation in animationsList[asset]) {
                var frames = animationsList[asset][animation]["frames"];
                var processedFrames = [];
                var duration = 0;
                var currentSecond = 0;
                for (var i = 0; i < frames.length; i++) {
                    duration += frames[i]['t'];
                    processedFrames.push({
                        "begin":    currentSecond,
                        "end":      currentSecond + frames[i]['t'],
                        "img":      this['imagesList'][asset][frames[i]['i']]
                    });
                    currentSecond += frames[i]['t'];
                };
                result[asset][animation] = {
                    "duration": duration,
                    "end":      animationsList[asset][animation]["end"],
                    "frames":   processedFrames
                };
            };
        };
        this['animationsListFinished'] = result;
        return result;
    };
    /**
     * Получить обработанные активы анимации
     * @return {Object|Boolean}
     */
    this.getAnimationAssets = function(animationObject, animation) {
        var assets = this['animationsListFinished'];
        if (assets) {
            if (animationObject) {
                if (assets[animationObject] && assets[animationObject][animation]) {
                    return assets[animationObject][animation];
                } else {
                    return false;
                };
            } else {
                return assets;
            };

        } else {
            return false;
        };
    };


    /**
     * Получение юнитов
     * @param dir
     * @param catalog
     * @return {Boolean}
     */
    this.unitLoad = function(dir, catalog) {
        var filePath = dir + '/' + catalog;
        var result   = false;
        $.ajax(
            $.extend(
                true,
                _.clone(this['ajax']),
                {
                    "context":  this,
                    "url":      filePath,
                    "success":  function(data) {
                        var that = this;
                        // получаем список анимаций:
                        var unitsList = data['units'];
                        // вытаскиваем детальную информацию:
                        var units ={};
                        for (var i = 0; i < unitsList.length; i++) {
                            var path = dir + '/' + unitsList[i] + '/' + this['assetDescription'];
                            $.ajax(
                                $.extend(
                                    true,
                                    _.clone(this['ajax']),
                                    {
                                        "url":  path,
                                        "success": function(data) {
                                            units[unitsList[i]] = data;
                                        }
                                    }
                                )
                            );
                        };
                        if (_.size(units)) {
                            // дополняем список активов:
                            if (this['unitsList']) {
                                $.extend(true, this['unitsList'], units);
                            } else {
                                this['unitsList'] = units;
                            };
                            if (this['unitsLoaded']) {
                                this['unitsLoaded'](this['unitsList']);
                            };
                            result = this['unitsList'];
                        } else {
                            result = false;
                        };
                    }
                }
            )
        );
        return result;
    };



    this.init = function(options) {
        // подгребаем значения по умолчанию:
        $.extend(true, this, _.clone(defaultSettings), options);
        // подгребаем анимацию:
        this.animationLoad(this['animationsDir'], this['assetsCatalog']);
        // подгребаем юниты:
        //this.unitLoad(this['unitsDir'], this['assetsCatalog']);
        return true;
    };
    // инициализация:
    this.init(options);
};