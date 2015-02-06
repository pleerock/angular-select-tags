/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name selectTags
     * @restrict E
     * @description
     *
     * @param {string} placeholder Text that will be added to input as default text (placeholder)
     * @param {number} minLength Minimal length of the tag to be added
     * @param {number} maxLength Maximal length of the tag to be added
     * @param {number} maxItems Maximal number of items that are allowed to be added to the tags
     * @param {boolean} uniqueNames Indicates if user can add only tags with unique names
     * @param {string} delimiters Array of characters, on press on which new tag will be added
     * @param {boolean} noPersist If set to true then user cannot add a new tag
     * @param {boolean} isRemoveButton Indicates if remove button is enabled
     * @param {boolean} isRestoreOnBackspace If set to true then tag will be restored (not deleted) to text when user press backspace
     * @param {Function} tagsDecorator Function used to decorate and change representation (view) of the tag
     * @param {number} caretPosition Used to control caret position in the tags input
     * @param {Function} tokenInputValue Text value inside input
     * @param {Function} containerWidth Component's width
     * @param {boolean} closeDropdownOnTagAdd Indicates if we do automatically close a dropdown menu when tag added or not
     * @param {expression} ngModel Model that will be changed
     * @param {expression} onChanged Expression to be evaluated when model is changed
     * @param {expression} selectOptions Options to be parsed and used for items data source and other options
     * @param {Function} selectedItemDecorator Decorator function that can wrap or change how item will be shown in the items box
     * @param {string} nothingSelectedLabel Decorator function that can wrap or change how item will be shown in the items box
     * @param {string} selectedItemsSeparator Separator character used between items
     * @param {number} selectedItemsShowLimit Maximal number of items to be shown in the box
     * @param {boolean} disabled If set to true then all interactions with the component will be disabled
     * @param {boolean} multiselect If set to true then user can select multiple options from the list of items. In this
     *                              case ng-model will be an array. If set to false then user can select only one option
     *                              from the list of items. In this case ng-model will not be array
     * @param {number} dropdownShowLimit Maximal number of items to show in the dropdown
     * @param {boolean} search If set to true, then search input will be shown to the user, where he can peform a search
     *                          in the list of items
     * @param {Function} searchFilter Filter that controls the result of the search input
     * @param {expression|object} searchKeyword Model used to be a search keyword that user types in the search box
     * @param {boolean} autoSelect If set to true, then first item of the give select-items will be selected.
     *                             This works only with single select
     * @param {boolean} selectAll If set to true, then "select all" option will be shown to user. This works only when
     *                              multiple items mode is enabled
     * @param {boolean} groupSelectAll If set to true, then "select all" option will be shown to user. This works only
     *                                  when item groups are enabled
     * @param {boolean} hideControls If set to true, then all select-items controls will be hidden. Controls such as
     *                               checkboxes and radio boxes
     * @param {boolean} hideNoSelection If set to true, then all "nothing is selected" label and checkbox will not be
     *                                      shown. This label show only in single select mode
     * @param {string} searchPlaceholder Custom placeholder text that will be in the search box
     * @param {string} selectAllLabel Custom text that will be used as a "select all" label.
     *                                  This label show only in single select mode
     * @param {string} deselectAllLabel Custom text that will be used as a "deselect all" label.
     *                                  This label show only in multi select mode
     * @param {string} noSelectionLabel Custom text that will be used as a "no items selected" label.
     *                                  This label show only in multiselect mode.
     * @param {string} loadingLabel Custom text that will be used to show a message when items are loaded for the first
     *                              time. This works only if loadPromise is given.
     * @param {Function} loadPromise A callback that makes some job (for example $http request) and gets the data to show
     *                              in the items list right after component initialization. Callback must return promise
     *                              that contains a valid data for the select items.
     * @param {Function} loadByKeywordPromise A callback that makes some job (for example $http request) and gets the data
     *                                      to show in the items list when search keyword is changed.
     *                                      Callback must return promise that contains a valid data for the select items.
     * @param {number} loadByKeywordDelay A delay time (in milliseconds) before a loadByKeywordPromise will run
     * @param {number} loadByKeywordMinQueryLength Minimal search keyword query length to make loadByKeywordPromise to run.
     * @param {Array.<Function>} filters Filters used to filter out values that must not be shown.
     * @param {Function} dropdownItemDecorator Custom decorator used to change a view of the list item
     * @param {Function} dropdownGroupDecorator Custom decorator used to change a view of the list item group
     */
    angular.module('selectTags').directive('selectTags', selectTags);

    /**
     * @ngInject
     */
    function selectTags($timeout, $parse) {
        return {
            //scope: true,
            replace: true, // check and confirm if this not cause any issues
            restrict: 'E',
            template: function(element, attrs) {
                var id = 'select_tags_' + s4() + '_' + s4() + '_' + s4();
                var html = element.html().trim();

                return ['<div class="select-tags" tabindex="1" data-id="' + id + '">',
                    '<tags-input id="' + id + '" ',
                            'class="tags-input"',
                            'ng-class="{\'opened\': ' + id + '.isOpened, \'closed\': !' + id + '.isOpened}"',
                            'placeholder="' + (attrs.placeholder ? attrs.placeholder : '') + '"',
                            attrs.minLength ? 'min-length="' + attrs.minLength + '"': '',
                            attrs.maxLength ? 'max-length="' + attrs.maxLength + '"': '',
                            attrs.maxItems ? 'max-items="' + attrs.maxItems + '"': '',
                            attrs.uniqueNames ? 'unique-names="' + attrs.uniqueNames + '"': '',
                            attrs.delimiters ? 'delimiters="' + attrs.delimiters + '"': '',
                            attrs.noPersist ? 'no-persist="' + attrs.noPersist + '"': '',
                            'is-remove-button="' + attrs.isRemoveButton + '"',
                            'is-restore-on-backspace="' + attrs.isRestoreOnBackspace + '"',
                            'ng-model="' + attrs.ngModel + '"',
                            attrs.onChange ? 'on-change="' + attrs.onChange + '"' : '',
                            'select-options="' + attrs.selectOptions + '"',
                            'caret-position="' + id + '.caretPosition"',
                            'decorator="' + attrs.tagsDecorator + '"',
                            'disabled="' + attrs.disabled + '"',
                            '></tags-input>',
                    '<open-dropdown class="open-dropdown" ',
                                    'for="' + id + '" ',
                                    'disabled="' + attrs.disabled + '"',
                                    'fit-width-to-attached-container="true"',
                                    'tabindex="3" ',
                                    'toggle-click="true" ',
                                    'is-opened="' + id + '.isOpened">',
                        '<select-items class="select-items"',
                                'multiselect="true"',
                                'search="false"',
                                'select-options="' + attrs.selectOptions + '"',
                                'ng-model="' + attrs.ngModel + '"',
                                attrs.onChange ? 'on-change="' + attrs.onChange + '"' : '',
                                attrs.dropdownShowLimit ? 'show-limit="' + attrs.dropdownShowLimit + '"' : '',
                                attrs.maxItems ? 'selection-limit="' + attrs.maxItems + '"': '',
                                attrs.searchFilter ? 'search-filter="' + attrs.searchFilter + '"' : '',
                                attrs.autoSelect ? 'auto-select="' + attrs.autoSelect + '"' : '',
                                attrs.selectAll ? 'select-all="' + attrs.selectAll + '"' : '',
                                attrs.groupSelectAll ? 'group-select-all="' + attrs.groupSelectAll + '"' : '',
                                attrs.hideControls ? 'hide-controls="' + attrs.hideControls + '"' : '',
                                attrs.hideNoSelection ? 'hide-no-selection="' + attrs.hideNoSelection + '"' : '',
                                attrs.selectAllLabel ? 'select-all-label="' + attrs.selectAllLabel + '"' : '',
                                attrs.deselectAllLabel ? 'deselect-all-label="' + attrs.deselectAllLabel + '"' : '',
                                attrs.noSelectionLabel ? 'no-selection-label="' + attrs.noSelectionLabel + '"' : '',
                                attrs.loadingLabel ? 'loading-label="' + attrs.loadingLabel + '"' : '',
                                attrs.loadPromise ? 'load-promise="' + attrs.loadPromise + '"' : '',
                                attrs.loadByKeywordPromise ? 'load-by-keyword-promise="' + attrs.loadByKeywordPromise + '"' : '',
                                attrs.loadByKeywordDelay ? 'load-by-keyword-delay="' + attrs.loadByKeywordDelay + '"' : '',
                                attrs.loadByKeywordMinQueryLength ? 'load-by-keyword-min-query-length="' + attrs.loadByKeywordMinQueryLength + '"' : '',
                                attrs.filters ? 'filters="' + attrs.filters + '"' : '',
                                attrs.dropdownItemDecorator ? 'decorator="' + attrs.dropdownItemDecorator + '"' : '',
                                attrs.dropdownGroupDecorator ? 'group-decorator="' + attrs.dropdownGroupDecorator + '"' : '',
                                'number-of-displayed-items="numberOfDisplayedItems"',
                                'search-keyword="' + id + '.userInputText"',
                                'model-insert-position="' + id + '.caretPosition"',
                        '>' + html + '</select-items></open-dropdown></div>'].join('');
            },
            link: function(scope, element, attrs) {

                // ---------------------------------------------------------------------
                // Variables
                // ---------------------------------------------------------------------

                var tagsInputElementCtrl;
                var getTagsInputElementCtrl = function() {
                    if (!tagsInputElementCtrl) {
                        var tagsInputElement = element[0].getElementsByClassName('tags-input')[0];
                        tagsInputElementCtrl = angular.element(tagsInputElement).controller('tagsInput');
                    }
                    return tagsInputElementCtrl;
                };

                var selectItemsElement = element[0].getElementsByClassName('select-items')[0];
                var selectItemsElementCtrl = angular.element(selectItemsElement).controller('selectItems');
                var id = angular.element(element).attr('data-id');
                scope[id] = { };

                /**
                 * Text that current user entered in the input box.
                 * Used for select-items to filter its items by this search keyword.
                 *
                 * @type {string}
                 */
                scope[id].userInputText = '';

                /**
                 * Indicates if dropdown is opened or not.
                 *
                 * @type {boolean}
                 */
                scope[id].isOpened = false;

                /**
                 * Controlled caret position of the tag input.
                 *
                 * @type {number}
                 */
                scope[id].caretPosition = 0;

                // ---------------------------------------------------------------------
                // Variables
                // ---------------------------------------------------------------------

                var closeDropdownOnTagAdd = attrs.closeDropdownOnTagAdd ? $parse(attrs.closeDropdownOnTagAdd)(scope) : false;

                // ---------------------------------------------------------------------
                // Event Listeners
                // ---------------------------------------------------------------------

                // listen to key downs to control drop down interaction
                element[0].addEventListener('keydown', function(e) {
                    switch (e.keyCode) {

                        case 38: // KEY "UP"
                            e.preventDefault();
                            scope.$broadcast('select-items.active_next'); // activate (select) next item in the dropdown
                            scope.$digest();
                            return;

                        case 40: // KEY "DOWN"
                            e.preventDefault();
                            scope.$broadcast('select-items.active_previous'); // activate (select) previous item in the dropdown
                            scope.$digest();
                            return;

                        case 13: // KEY "ENTER"
                            if (scope[id].isOpened) {
                                e.preventDefault(); // this is required if for example to prevent form update
                                var isItemSelected = selectItemsElementCtrl.selectActive();

                                // if item was selected from the item list then we stop propagation to prevent
                                // tags-input to add a new tag (tag with user's entered value)
                                if (isItemSelected === true) {
                                    e.stopPropagation();
                                    if (closeDropdownOnTagAdd)
                                        scope[id].isOpened = false;  // after item is selected automatically close dropdown
                                }
                                scope.$digest();
                            }
                            return;
                    }
                }, true);

                // when new item selected in the select-items list we must update caret position in the
                // select-tags-input directive and also clear input of that
                scope.$on('select-items.item_selected', function(event, data) {
                    if (data.element !== selectItemsElement)
                        return;

                    // update caret positions based on selection results
                    if (data.isNewSelection)
                        ++scope[id].caretPosition;
                    else if (scope[id].caretPosition > 0 && scope[id].caretPosition > data.index)
                        --scope[id].caretPosition;


                    $timeout(function() { // timeout is required to prevent lag of tags-input

                        getTagsInputElementCtrl().clearInputValue();
                        //scope.$broadcast('tags-input.clear_input'); // broadcast that we need to clear input content
                    });
                });

                // when user types a text into tags input box, we must filter our items in the select-items directive
                // to show only items that are matched what user typed
                $timeout(function() {
                    getTagsInputElementCtrl().onTextEntered(function(text) {
                        scope[id].userInputText = text;
                        scope[id].isOpened = true; // open dropdown automatically as user types
                    });
                }, 300 /* temporary solution - find way to solve this problem */ );

            }
        };
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

})();