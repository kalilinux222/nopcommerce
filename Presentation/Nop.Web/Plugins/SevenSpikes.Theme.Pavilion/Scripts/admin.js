﻿(function ($, customPreset) {
    $(document).ready(function () {
        var pavilionSettings = $('#pavilion-settings-edit');
        var enabledAsWidgetId = pavilionSettings.attr('data-enabledaswidgetId');
        var logoImageId = pavilionSettings.attr('data-logoImageId');
        var presetFieldId = pavilionSettings.attr('data-presetfieldId');

        function logoOverrideChanged() {
            if ($(logoImageId).length === 0) {
                return;
            }

            if ($(logoImageId).is(':checked')) {
                $(".upload-image-overlay").remove();
            } else {
                $('#logo-image').append("<div class=\"upload-image-overlay\"></div>");
            }
        }

        function showThemeSettings() {
            $('.theme-settings, #pavilion-settings-edit li.additional-settings').toggle($(enabledAsWidgetId).is(':checked'));
        }

        function colorPreset() {
            if ($(presetFieldId).length === 0) {
                return;
            }

            if ($(presetFieldId).is(':checked')) {
                $(".theme-color .adminData .upload-image-overlay").remove();
            } else {
                $('.theme-color .adminData').append("<div class=\"upload-image-overlay\"></div>");
            }
        }

        $(logoImageId).change(logoOverrideChanged);
        $(enabledAsWidgetId).change(showThemeSettings);
        $(presetFieldId).change(colorPreset);

        logoOverrideChanged();
        showThemeSettings();
        colorPreset();

        pavilionSettings.kendoTabStrip({
            animation: {
                open: {
                    effects: "none"
                }
            }
        });

        $(".theme-color .adminData div").click(function () {
            $(".theme-color .adminData div").removeClass("active");
            $(this).addClass("active");
            // check the current radio button with js, because as we hide the radio buttons they are not checked when clicking on them
            var inputs = $(".theme-color .adminData div input");
            $.each(inputs, function (index, item) {
                item.removeAttribute("checked");
            });
            $(this).find('input')[0].setAttribute("checked", "checked");
        });

        $(".theme-color .adminData div input[checked]").closest('.radionButton').addClass("active");

        var customerPresetObj = new customPreset('.theme-color .radionButton:last label', '.theme-color .radionButton label');
        customerPresetObj.setPresetsBackgroundColor();
        customerPresetObj.addKendoColorPickerToTheLastRadioButton();
        
        $('.theme-color .radionButton label').each(function () {
            var that = $(this);
            var parent = that.closest('.radionButton');
            
            if (parent.next().length === 0) {
                if (parent.children('.radionButtonInner').length === 0) {
                    parent.children().not('.before').wrapAll('<div class="radionButtonInner" />');
                }

                if (parent.children('.color-picker-icon').length === 0) {
                    parent.append('<span class="color-picker-icon"></span>');
                }

                return;
            }

            that.css('background-color', '');

            if (that.siblings('label').index() > that.index()) {
                that.css('border-top-color', '#' + that.text());
            }
            else {
                that.css('border-bottom-color', '#' + that.text());
            }
        });
    });
})(jQuery, CustomPreset);