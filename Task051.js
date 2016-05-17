(function (window) {
    // 由于是第三方库，我们使用严格模式，尽可能发现潜在问题
    'use strict';
    function IfeAlbum() {
        // 布局的枚举类型
        this.LAYOUT = {
            PUZZLE: 1,    // 拼图布局
            WATERFALL: 2, // 瀑布布局
            BARREL: 3     // 木桶布局
        };
        this.defaults = {
            BarrelHeightMax : 200,
            BarrelHeightMin : 100,
            BarrelNumMin : 3,
            BarrelNumMax : 6,
            PaddingTopBottom : 0,
            PaddingLeftRight : 0,
            WaterfallColumnNum : 4
        };
        // 公有变量可以写在这里
        // this.xxx = ...
        this.Selector;
        this.Layout;
        this.FullscreenEnabled = true;
    };

    // 私有变量可以写在这里
    // var xxx = ...



    /************* 以下是本库提供的公有方法 *************/


    /**
     * 设置相册的布局
     * @param {number} layout 布局值，IfeAlbum.LAYOUT 中的值
     */
    IfeAlbum.prototype.setLayout = function (myLayout) {
        this.Layout = myLayout;
        var layout = this.Layout,
            Selector = this.Selector,
        li_array = $(Selector).find('li');
        if(li_array.length === 0){
            alert('相册为空无法设置！');
            return;
        }
        $( li_array ).css('padding', this.defaults.PaddingTopBottom/2+'px'+' '+ this.defaults.PaddingLeftRight/2+'px');
        if(layout === 1){
            var str = 'puzzle_layout_' + li_array.length;
            $(Selector).addClass('lay_out');
            $(Selector).addClass(str);
        }
        if(layout === 2){
            $(Selector).addClass('lay_out');
            $(Selector).addClass('waterfall_layout');
            var ColumnNum = this.defaults.WaterfallColumnNum;
            var ColumnObjs = [];
            for(var i = 0; i < ColumnNum; i++){
                var obj = {};
                var div_ele = document.createElement('div');
                $(div_ele).css('width',100/ColumnNum + '%');
                $(Selector).append(div_ele);
                obj.div_ele = div_ele;
                obj.client_height = 0;
                ColumnObjs.push(obj);
            }
            for(var j = 0, len = li_array.length; j < len; j++ ){
                var shortest_colu = ColumnObjs[0];
                var test = 0;
                for (var k = 1; k < ColumnObjs.length; k++){
                    if(shortest_colu.client_height > ColumnObjs[k].client_height){
                        shortest_colu = ColumnObjs[k];
                        test = k;
                    }
                }
                shortest_colu.div_ele.appendChild(li_array[j]);
                shortest_colu.client_height += li_array[j].clientHeight;
            }
        }
        if(layout === 3){
            $(Selector).addClass('lay_out');
            $(Selector).addClass('barrel_layout');
            var total_width = 0;
            var display_height = (this.defaults.BarrelHeightMin + this.defaults.BarrelHeightMax)/2;
            var row_param = [];
            var counter = 0;
            for (var i = 0; i < li_array.length; i++ ){
                var real_height = $(li_array[i]).find('img')[0].clientHeight;
                var real_width = $(li_array[i]).find('img')[0].clientWidth;
                var ratio = display_height / real_height;
                total_width += real_width * ratio;
                counter ++;
                if (total_width >= parseInt($(Selector).css('width'))&& counter >= this.defaults.BarrelNumMin || counter >= this.defaults.BarrelNumMax){
                    display_height = parseInt($(Selector).css('width'))/total_width * display_height;
                    if( display_height < this.defaults.BarrelHeightMin){
                        row_param.push({num : counter, height : this.defaults.BarrelHeightMin});
                    }
                    else if(display_height > this.defaults.BarrelHeightMax){
                        row_param.push({num : counter, height : this.defaults.BarrelHeightMax});
                    }
                    else {
                        row_param.push({num : counter, height : display_height});
                    }
                    counter = 0;
                    total_width = 0;
                    display_height = (this.defaults.BarrelHeightMin + this.defaults.BarrelHeightMax)/2;
                }
                /*最后一排图片较少情况*/
                if( i === li_array.length-1 && counter != 0 ){
                    row_param.push( {num : counter, height : display_height} );
                }
            }
            var index = 0;
            for ( var i = 0; i < row_param.length; i++ ){
                var line_container = document.createElement('div');
                line_container.style.height = row_param[i].height + 'px';
                for ( var j = 0; j < row_param[i].num; ++j ){
                    $(li_array[index + j]).css('width',row_param[i].height/$(li_array[index + j]).height()*$(li_array[index + j]).width()-0.01+'px');
                    $(line_container).append(li_array[index + j]);
                }
                $(Selector).append(line_container);
                index += row_param[i].num;
            }
        }
    };
    /**
     * 初始化并设置相册
     * 当相册原本包含图片时，该方法会替换原有图片
     * @param {(string|string[])} image  一张图片的 URL 或多张图片 URL 组成的数组
     * @param {object}            option 配置项
     */
    IfeAlbum.prototype.setImage = function (image,mySelector) {
        if (typeof image === 'string') {
            // 包装成数组处理
            this.setImage([image]);
            return;
        }
        // 你的实现
        this.Selector = mySelector;
        var image = image,
            Selector = this.Selector;
            if(image){
                for (var i = 0, len = image.length; i < len; i++){
                    var li_ele = document.createElement('li');
                    var img_ele = document.createElement('img');
                    $(img_ele).attr({ src : image[i] });
                    $( li_ele ).append( img_ele );
                    $( Selector ).append( li_ele );
            }
        }
    };

    /**
     * 获取相册所有图像对应的 DOM 元素
     * 可以不是 ，而是更外层的元素
     * @return {HTMLElement[]} 相册所有图像对应的 DOM 元素组成的数组
     */
    IfeAlbum.prototype.getImageDomElements = function(Selector) {
        var ImageDomElements = $(Selector).find('li');
        return ImageDomElements;
    };

    /**
     * 向相册添加图片
     * 在拼图布局下，根据图片数量重新计算布局方式；其他布局下向尾部追加图片
     * @param {(string|string[])} image 一张图片的 URL 或多张图片 URL 组成的数组
     */
    IfeAlbum.prototype.addImage = function (image) {
        var image = image,
            Selector = this.Selector;
        if(image){
            for (var i = 0, len = image.length; i < len; i++){
                var li_ele = document.createElement('li');
                var img_ele = document.createElement('img');
                $(img_ele).attr({ src : image[i] });
                $( li_ele ).append( img_ele );
                $( Selector ).append( li_ele );
            }
        }
    };
    /**
     * 移除相册中的图片
     * @param  {(HTMLElement|HTMLElement[])} image 需要移除的图片
     * @return {boolean} 是否全部移除成功
     */
    IfeAlbum.prototype.removeImage = function (image) {
        $(image).parent().empty();
    };
    /**
     * 获取相册的布局
     * @return {number} 布局枚举类型的值
     */
    IfeAlbum.prototype.getLayout = function() {
        for(var i in this.LAYOUT){
            if(this.LAYOUT[i] ===this.Layout)
                return i;
        }
        return false;
    };

    /**
     * 设置图片之间的间距
     * 注意这个值仅代表图片间的间距，不应直接用于图片的 margin 属性，如左上角图的左边和上边应该紧贴相册的左边和上边
     * 相册本身的 padding 始终是 0，用户想修改相册外框的空白需要自己设置相框元素的 padding
     * @param {number}  x  图片之间的横向间距
     * @param {number} [y] 图片之间的纵向间距，如果是 undefined 则等同于 x
     */
    IfeAlbum.prototype.setGutter = function (x, y) {
        this.defaults.PaddingTopBottom = y;
        this.defaults.PaddingLeftRight = x;
    };

    IfeAlbum.prototype.setColumnNum = function(num) {
        this.defaults.WaterfallColumnNum = num;
    }

    /**
     * 允许点击图片时全屏浏览图片
     */
    IfeAlbum.prototype.enableFullscreen = function () {
        var that = this;
        $(this.Selector).on('click',function(event){
            if(!that.FullscreenEnabled)
                return false;
            var target = event.target;
            if(target.nodeName === 'IMG'){
                $('.mask_style').html('<img src='+target.src+'>');
                $('.mask_style').removeClass('display_none');
                $('.mask_style').addClass('display_flex');
            }
        })
        $('.mask_style').on('click',function(event){
            var target = event.target;
            if(target.nodeName === 'DIV'){
                $('.mask_style').html('');
                $('.mask_style').removeClass('display_flex');
                $('.mask_style').addClass('display_none');
            }
        })
    };

    /**
     * 禁止点击图片时全屏浏览图片
     */
    IfeAlbum.prototype.switchFullscreen = function () {
        if(this.FullscreenEnabled)
            this.FullscreenEnabled = false;
        else
            this.FullscreenEnabled = true;
    };

    /**
     * 获取点击图片时全屏浏览图片是否被允许
     * @return {boolean} 是否允许全屏浏览
     */
    IfeAlbum.prototype.isFullscreenEnabled = function () {
        return this.FullscreenEnabled;
    };

    /**
     * 设置木桶模式每行图片数的上下限
     * @param {number} min 最少图片数（含）
     * @param {number} max 最多图片数（含）
     */
    IfeAlbum.prototype.setBarrelBin = function (min, max) {

        // 注意异常情况的处理，做一个健壮的库
        if (min === undefined || max === undefined || min > max) {
            console.error('...');
            return;
        }
        // 你的实现
        this.defaults.BarrelNumMax = max;
        this.defaults.BarrelNumMin = min;
    };

    /**
     * 获取木桶模式每行图片数的上限
     * @return {number} 最多图片数（含）
     */
    IfeAlbum.prototype.getBarrelBinMax = function () {
        return this.defaults.BarrelNumMax;//不合理。
    };

    /**
     * 获取木桶模式每行图片数的下限
     * @return {number} 最少图片数（含）
     */
    IfeAlbum.prototype.getBarrelBinMin = function () {
        return this.defaults.BarrelNumMin;
    };

    /**
     * 设置木桶模式每行高度的上下限，单位像素
     * @param {number} min 最小高度
     * @param {number} max 最大高度
     */
    IfeAlbum.prototype.setBarrelHeight = function (min, max) {
        this.defaults.BarrelHeightMax = max;
        this.defaults.BarrelHeightMin = min;
    };

    /**
     * 获取木桶模式每行高度的上限
     * @return {number} 最多图片数（含）
     */
    IfeAlbum.prototype.getBarrelHeightMax = function () {
        return this.defaults.BarrelHeightMax;
    };

    /**
     * 获取木桶模式每行高度的下限
     * @return {number} 最少图片数（含）
     */
    IfeAlbum.prototype.getBarrelHeightMin = function () {
        return this.defaults.BarrelHeightMin;
    };


    // 以后再更新吧


    /************* 以上是本库提供的公有方法 *************/
    // 实例化
    if (typeof window.ifeAlbum === 'undefined') {
        // 只有当未初始化时才实例化
        window.ifeAlbum = new IfeAlbum();
    }
}(window));