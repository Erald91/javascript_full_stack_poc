"use strict";
(() => {
    let init = () => {
        // Initialize and configure JQuery Color Picker plugin
        $('select[name="color-picker"]').simplecolorpicker();
        $('select[name="color-picker"]').simplecolorpicker('selectColor', '#000000');
        $('select[name="color-picker"]').simplecolorpicker('destroy');
        $('select[name=color-picker]').simplecolorpicker({
            picker: false
        });
    }
    
    $(document).ready((event) => {
        init();
    })
})();