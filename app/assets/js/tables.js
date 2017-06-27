/* ============================================================
 * Tables
 * Generate advanced tables with sorting, export options using
 * jQuery DataTables plugin
 * For DEMO purposes only. Extract what you need.
 * ============================================================ */
(function($) {

    'use strict';

    // Initialize a dataTable with collapsible rows to show more details
    var initDetailedViewTable = function() {

        var _format = function(d) {
            // `d` is the original data object for the row
            return '<h5>History</h5>' +
                '<table class="table table-inline history-table">' +
                '<tr>' +
                '<td>N/A or Show below</td>' +
                '<td></td>' +
                '</tr>' +
                '<tr>' +
                '<td>$20</td>' +
                '<td>04.12.17</td>' +
                '</tr>' +
                '</table>' +
                '<button ng-click="removeAccount(r)" class="btn btn-success btn-xs m-b-30">Delete Account</button>';
        }

        var table = $('#detailedTable');

        table.DataTable({
            "sDom": "t",
            "scrollCollapse": true,
            "paging": false,
            "bSort": false
        });

        // Add event listener for opening and closing details
        $('#detailedTable tbody').on('click', 'tr', function() {
            //var row = $(this).parent()
            if ($(this).hasClass('shown') && $(this).next().hasClass('row-details')) {
                $(this).removeClass('shown');
                $(this).next().remove();
                return;
            }
            var tr = $(this).closest('tr');
            var row = table.DataTable().row(tr);

            $(this).parents('tbody').find('.shown').removeClass('shown');
            $(this).parents('tbody').find('.row-details').remove();

            row.child(_format(row.data())).show();
            tr.addClass('shown');
            tr.next().addClass('row-details');
        });

    }

    initDetailedViewTable();

})(window.jQuery);
