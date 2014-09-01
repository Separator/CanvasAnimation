/**
 * Created with JetBrains WebStorm.
 * User: Separator
 * Date: 05.07.14
 * Time: 13:51
 * To change this template use File | Settings | File Templates.
 * Required: jquery, underscore
 */

function Animation(options) {
    var defaultSettings = {
        "intervalIndex":        -1,
        "interval":             40,

        "assets":               null,
        "animationList":        [],
        "objectsList":          {},

        "canvas":               null,
        "canvasWidth":          800,
        "canvasHeight":         400,
        "minCanvasWidth":       100,
        "minCanvasHeight":      100,
        "context":              null,

        "hasOffset":            false,
        "halfWidth":            null,
        "halfHeight":           null,
        "worldX":               null,
        "worldY":               null,
        "drawRadius":           100,
        "rX1":                  null,
        "rX2":                  null,
        "rY1":                  null,
        "rY2":                  null
    };

    /**
     * Очистить холст
     */
    this.clear = function() {
        this['context'].clearRect(
            this['worldX'] - this['halfWidth'],
            this['worldY'] - this['halfHeight'],
            this['canvasWidth'] + 10, this['canvasHeight'] + 10
        );
    };
    /**
     * Изменение размера холста
     * @param width
     * @param height
     */
    this.sizeCanvas = function(width, height) {
        width  = (Math.round(width)  >= this['minCanvasWidth'])  ? Math.round(width)  : this['minCanvasWidth'];
        height = (Math.round(height) >= this['minCanvasHeight']) ? Math.round(height) : this['minCanvasHeight'];
        $(this['canvas'])
            .attr('width',  width)
            .attr('height', height);
        this['canvasWidth']  = width;
        this['canvasHeight'] = height;
        this['halfWidth']    = Math.round(this['canvasWidth']  / 2);
        this['halfHeight']   = Math.round(this['canvasHeight']  / 2);
    };
    /**
     * Смещение камеры на заданное расстояние
     * @param offsetX
     * @param offsetY
     */
    this.offsetCam = function(offsetX, offsetY) {
        offsetX = Math.round(offsetX);
        offsetY = Math.round(offsetY);
        this['hasOffset'] = true;
        this['worldX'] += offsetX;
        this['worldY'] += offsetY;
        this['context'].translate( - offsetX, - offsetY);
        // координаты квадрата отрисовки:
        this['rX1'] = this['worldX'] - this['halfWidth'] - this['drawRadius'];
        this['rX2'] = this['worldX'] + this['halfWidth'] + this['drawRadius'];
        this['rY1'] = this['worldY'] - this['halfHeight'] - this['drawRadius'];
        this['rY2'] = this['worldY'] + this['halfHeight'] + this['drawRadius'];
    };
    /**
     * Сброс холста в значения по умолчанию
     */
    this.normalize = function() {
        this.sizeCanvas(this['canvasWidth'], this['canvasHeight']);
        if (this['hasOffset']) {
            this['context'].restore();
            this['hasOffset'] = false;
        };
        this['context'].save();
        this['worldX'] = this['halfWidth'];
        this['worldY'] = this['halfHeight'];
        this.offsetCam( - this['halfWidth'], - this['halfHeight']);
    };
    /**
     * Переместить камеру в указанную точку
     * @param worldX
     * @param worldY
     */
    this.moveCamTo = function(worldX, worldY) {
        this.offsetCam(Math.round(worldX) - this['worldX'], Math.round(worldY) - this['worldY']);
    };
    /**
     * Изменить размеры области просмотра
     * @param width
     * @param height
     */
    this.sizeCam = function(width, height) {
        var currentWorldX = this['worldX'];
        var currentWorldY = this['worldY'];
        this['canvasWidth']  = Math.round(width);
        this['canvasHeight'] = Math.round(height);
        this.normalize();
        this.moveCamTo(currentWorldX, currentWorldY);
    };
    /**
     * Проверка на попадание анимации в область просмотра
     * @param X
     * @param Y
     * @return {Boolean}
     */
    this.checkAnimationCoordinates = function(X, Y, width, height) {
        width  = width || 0;
        height = height || 0;
        X = Math.round(X);
        Y = Math.round(Y);
        if (this['rX1'] <= X+width && X<=this['rX2'] && this['rY1']<=Y+height && Y<=this['rY2']) {
            return true;
        } else {
            return false;
        };
    };
    /**
     * Преобразование координаты X мира в координаты холста
     * Функцию можно переопределять
     * @param X
     * @return {Number}
     */
    this.worldToCanvasCoordinateX = function(X) {
        return Math.round(X);
    };
    /**
     * Преобразование координаты Y мира в координаты холста
     * Функцию можно переопределять
     * @param Y
     * @return {Number}
     */
    this.worldToCanvasCoordinateY = function(Y) {
        return Math.round(Y);
    };
    /**
     * Преобразование координаты Z мира в координаты холста
     * Функцию можно переопределять
     * @param Z
     * @return {Number}
     */
    this.worldToCanvasCoordinateZ = function(Z) {
        return Math.round(Z);
    };
    /**
     * Удаление анимации посредством индекса в массиве анимаций
     * @param animationIndex
     * @return {Boolean}
     */
    this.removeAnimationByIndex = function(animationIndex) {
        var animation = this['animationList'][animationIndex];
        if (animation) {
            delete this['objectsList'][animation['ObjectID']];
            this['animationList'] =
                this['animationList'].slice(0,animationIndex).concat(this['animationList'].slice(animationIndex+1));
            return true;
        } else {
            return false;
        };
    };
    /**
     * Удаление анимации через ID-объекта
     * @param ID
     * @return {Boolean}
     */
    this.removeAnimationByObjectID = function(ID) {
        if (ID in this['objectsList']) {
            return this.removeAnimationByIndex(this['objectsList'][ID]);
        } else {
            return false;
        };
    };
    /**
     * Изменение координат анимации
     * @param ID
     * @param X
     * @param Y
     * @param Z
     * @return {Boolean}
     */
    this.changeAnimationCoordinates = function(ID, X, Y, Z) {
        // проверка на наличие анимации для заданного объекта:
        if (!(ID in this['objectsList'])) {
            return false;
        };
        // расчёт координат анимации:
        X = this.worldToCanvasCoordinateX(X);
        Z = this.worldToCanvasCoordinateZ(Z);
        Y = this.worldToCanvasCoordinateY(Y) - Z;
        // проверка на вхождение анимации в область просмотра:
        if (!this.checkAnimationCoordinates(X, Y)) {
            return this.removeAnimationByObjectID(ID);
        }
        // изменение координат анимации:
        var animationIndex = this['objectsList'][ID];
        this['animationList'][animationIndex]['X'] = X;
        this['animationList'][animationIndex]['Y'] = Y;
        this['animationList'][animationIndex]['Z'] = Z;
        return true;
    };
    /**
     * Заморозить анимацию на текущем кадре
     * @param ID
     * @return {Boolean}
     */
    this.freezeAnimation = function(ID) {
        // проверка на наличие анимации для заданного объекта:
        if (!(ID in this['objectsList'])) {
            return false;
        };
        this['animationList'][this['objectsList'][ID]]['freeze'] = true;
        return true;
    };
    /**
     * Разморозить анимацию
     * @param ID
     * @return {Boolean}
     */
    this.unfreezeAnimation = function(ID) {
        // проверка на наличие анимации для заданного объекта:
        if (!(ID in this['objectsList'])) {
            return false;
        };
        this['animationList'][this['objectsList'][ID]]['freeze'] = undefined;
        return true;
    };
    /**
     * Обновить свойства анимации
     * @param index
     * @param animation
     * @return {Boolean}
     */
    this.updateAnimation = function(index, animation) {
        $.extend(this['animationList'][index], animation);
        return true;
    };
    /**
     * Завершить анимацию
     * @param ID
     * @return {*}
     */
    this.completeAnimation = function(ID) {
        if (!(ID in this['objectsList'])) {
            return false;
        };
        var index     = this['objectsList'][ID];
        var animation = this['animationList'][index];
        if (animation['anim']['end']) {
            return this.updateAnimation(
                index,
                {
                    "X":            animation['X'],
                    "Y":            animation['Y'],
                    "Z":            animation['Z'],
                    "ObjectID":     animation['ObjectID'],
                    "ObjectName":   animation['ObjectName'],
                    "alpha":        animation['alpha'],
                    "ObjectAction": animation['anim']['end'],
                    "lastExec":     (new Date()).getTime(),
                    "duration":     0,
                    "rotate":       animation['rotate'],
                    "anim":         this.getAssetAnimation(animation['ObjectName'], animation['anim']['end'])
                }
            );
        } else{
            return this.freezeAnimation(ID);
        };
    };
    /**
     * Получить указанную анимацию
     * @param animationObject
     * @param animation
     * @return {*}
     */
    this.getAssetAnimation = function(animationObject, animation) {
        if (this['assets'] && this['assets'][animationObject] && this['assets'][animationObject][animation]) {
            return this['assets'][animationObject][animation];
        } else {
            return false;
        };
    };
    /**
     * Добавление анимации
     * animation.X X - координата объекта
     * animation.Y Y - координата объекта
     * animation.Z Z - координата объекта
     * animation.ObjectID ID-объекта
     * animation.ObjectName Название объекта
     * animation.ObjectAction Название анимации
     * @param animation
     * @return {Boolean}
     */
    this.append = function(animation) {
        var X = this.worldToCanvasCoordinateX(animation['X']);
        var Z = this.worldToCanvasCoordinateZ(animation['Z']);
        var Y = this.worldToCanvasCoordinateY(animation['Y']) - Z;
        // проверка на вхождение в область просмотра:
        if (!this.checkAnimationCoordinates(X, Y)) {
            return false;
        };
        // проверка на наличие указанной анимации:
        var anim = this.getAssetAnimation(animation['ObjectName'], animation['ObjectAction']);
        if (!anim) {
            return false;
        };
        // удаление предыдущей анимации объекта:
        if (animation['ObjectID'] in this['objectsList']) {
            this.removeAnimationByObjectID(animation['ObjectID']);
        };
        // формируем объект анимации:
        var newAnimation = {
            "X":            X,
            "Y":            Y,
            "Z":            Z,
            "ObjectID":     animation['ObjectID'],
            "ObjectName":   animation['ObjectName'],
            "ObjectAction": animation['ObjectAction'],
            "alpha":        (animation['alpha']===undefined || animation['alpha']===null) ? 1 : animation['alpha'],
            "lastExec":     (new Date()).getTime(),
            "duration":     0,
            "rotate":       animation['rotate'],
            "anim":         anim
        };
        // ищем позицию для добавления анимации:
        var positionIndex;
        var len = this['animationList'].length;
        if (len) {
            var append = false;
            for (var i = 0; i < len; i++) {
                if (newAnimation['Y'] <= this['animationList'][i]['Y'] && newAnimation['Z'] <= this['animationList'][i]['Z']) {
                    this['animationList'] =
                        this['animationList'].slice(0,i).concat([newAnimation]).concat(this['animationList'].slice(i));
                    append = true;
                    positionIndex = i;
                    break;
                };
            };
            if (!append) {
                this['animationList'].push(newAnimation);
                positionIndex = this['animationList'].length - 1;
            };
        } else {
            positionIndex = 0;
            this['animationList'].push(newAnimation);
        };
        this['objectsList'][animation['ObjectID']] = positionIndex;
        return true;
    };
    /**
     * Остановить анимацию
     */
    this.stop = function() {
        clearInterval(this['intervalIndex']);
        this['intervalIndex'] = -1;
        return true;
    };
    /**
     * Запустить анимацию
     * @return {Boolean}
     */
    this.start = function() {
        var canvas = this['canvas'];
        if (!canvas) {
            return false;
        };
        // останавливаем анимацию:
        this.stop();
        // запускаем анимацию:
        var that = this;
        var context = this['context'];
        this['intervalIndex'] = setInterval(function () {
            // создаём массив для быстрого построения сцены:
            var sceneBuffer = [];
            // получаем текущее время:
            var currentTime = (new Date()).getTime();
            // проходимся по списку анимаций:
            var len = that['animationList'].length;
            for (var i = 0; i < len; i++) {
                var animation = that['animationList'][i];
                if (!that.checkAnimationCoordinates(animation['X'], animation['Y'])) {
                    that.removeAnimationByIndex(i);
                } else {
                    // вытаскиваем данные по анимации:
                    var asset = animation['anim'];
                    var assetFrames = asset['frames'];
                    if (animation['freeze']) {
                        var animationTime = animation['duration'];
                    } else {
                        var animationTime = (currentTime+animation['duration']-animation['lastExec'])%asset['duration'];
                    };
                    for (var j = 0; j < assetFrames.length; j++) {
                        if (assetFrames[j]['begin'] <= animationTime && animationTime <= assetFrames[j]['end']) {
                            // обновляем время последней прорисовки анимации:
                            that['animationList'][i]['lastExec'] = currentTime;
                            that['animationList'][i]['duration'] = animationTime;
                            // помещаем параметры рассчитанной анимации в буфер:
                            sceneBuffer.push({
                                'X':        animation['X'],
                                'Y':        animation['Y'],
                                'rotate':   animation['rotate'],
                                'alpha':    animation['alpha'],
                                'image':    assetFrames[j]['img']
                            });
                            break;
                        };
                    };
                };
            };
            // очищаем холст и выводим изображения:
            that.clear();
            var globalAlpha = context.globalAlpha;
            var len = sceneBuffer.length;
            for (var i = 0; i < sceneBuffer.length; i++) {
                if (sceneBuffer[i]['alpha'] != 1) {
                    context.globalAlpha = sceneBuffer[i]['alpha'];
                };
                context.drawImage(sceneBuffer[i]['image'], sceneBuffer[i]['X'], sceneBuffer[i]['Y']);
                if (sceneBuffer[i]['alpha'] != 1) {
                    context.globalAlpha = globalAlpha;
                };
            };
        }, this['interval']);
    };
    /**
     * Инициализация объекта
     * @param options
     * @return {Boolean}
     */
    this.init = function(options) {
        // подгребаем значения по умолчанию:
        $.extend(true, this, _.clone(defaultSettings), options);
        // получаем контекст:
        this['context'] = this['canvas'].getContext('2d');
        // инициализируем canvas:
        this.normalize();
        return true;
    }
    // инициализация:
    this.init(options);
};