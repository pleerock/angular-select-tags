/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name selectTags
     *
     * This directive provides a ability to select items from the given list to the given model.
     * Supports both multiple and single select modes.
     */
    angular.module('selectTags', ['selectOptions', 'ngSanitize', 'tagsInput', 'openDropdown', 'selectItems']);

})();