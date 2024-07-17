/*
* Copyright 2016 Seven Spikes Ltd. All rights reserved. (http://www.nop-templates.com)
* http://www.nop-templates.com/t/licensinginfo
*/

(function ($) {
    var addCategoryToSortableList = function (elementText) {
        var element = $(elementText);

        if ($('.categories-sortable-list span[data-categoryId="' + element.attr('data-categoryId') + '"]').length > 0) {
            return;
        }

        element.addClass('sortable');

        element.append('<span class="remove-category-item remove-item-button">X</span>');

        $('.categories-sortable-list').append(element);
    };

    var getData = function () {
        var data = {
            categoryName: $('#choose-category-autocomplete').val() || ''
        };

        data = addAntiForgeryToken(data);

        return data;
    };

    var updateSelectedCategories = function () {
        var categoriesString = '';
        var displayOrder = 0;

        $('.categories-sortable-list span.sortable[data-categoryid]').each(function() {
            var that = $(this);

            categoriesString += that.attr('data-categoryid') + ':' + displayOrder;

            if (that.next('span.sortable[data-categoryid]').length > 0) {
                categoriesString += ',';
            }

            displayOrder++;
        });

        $('#CategoryIds').val(categoriesString);
    };

    var updateSelectedSources = function () {
        var sourcesString = '';
        var displayOrder = 0;

        $('.sources-sortable-list span.sortable[data-sourceId]').each(function () {
            var that = $(this);

            sourcesString += that.attr('data-sourceId') + ':' + displayOrder;

            if (that.next('span.sortable[data-sourceId]').length > 0) {
                sourcesString += ',';
            }

            displayOrder++;
        });

        $('#SourceIds').val(sourcesString);
    };

    $(document).ready(function () {

        // Categories

        $('#choose-category-autocomplete').kendoAutoComplete({
            dataTextField: 'name',
            filter: 'contains',
            highlightFirst: true,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: {
                        url: $('.category-autocomplete-wrapper').attr('data-getCategoriesUrl'),
                        dataType: 'json',
                        data: getData
                    }
                }
            },
            template: kendo.template($('#categoriesSortingTemplate').html()),
            change: function () {
                addCategoryToSortableList($('#choose-category-autocomplete_listbox .k-state-selected').html());

                this.value('');

                updateSelectedCategories();
            }
        });

        $('.categories-sortable-list').kendoSortable({
            axis: 'y',
            filter: 'span.sortable',
            container: $('.categories-sortable-list'),
            hint: function (element) {
                return $('<div class="sortable-categories-drag-drop-hint">' + element.html() + '</div>');
            },
            change: updateSelectedCategories
        });
        
        $('.categories-sortable-list').on('click', '.remove-category-item', function () {
            $(this).closest('.sortable[data-categoryid]').remove();

            updateSelectedCategories();
        });


        // Sources

        $('.sources-sortable-list').kendoSortable({
            axis: 'x',
            filter: 'span.sortable',
            container: $('.sources-sortable-list'),
            hint: function (element) {
                return $('<div class="sortable-sources-drag-drop-hint">' + element.html() + '</div>');
            },
            change: updateSelectedSources
        });

        $('.available-source-types').on('click', '.sortable', function () {
            $(this).closest('.sortable[data-sourceId]').appendTo($('.sources-sortable-list .selected-source-types'));

            updateSelectedSources();
        });

        $('.sources-sortable-list').on('click', '.remove-source-item', function () {
            $(this).closest('.sortable[data-sourceId]').appendTo($('.available-source-types'));

            updateSelectedSources();
        });
    });

})(jQuery);