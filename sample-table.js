document.addEventListener("DOMContentLoaded", function() {
    fetch('data.csv')
        .then(response => response.text())
        .then(csvString => {
            // Use PapaParse to parse the CSV string
            let data = Papa.parse(csvString, {
                header: true,
                skipEmptyLines: true
            });

            // Initialize DataTable with parsed data
            var table = $('#data-table').DataTable({
                data: data.data,
                columns: data.meta.fields.map(field => ({
		    title: field,
		    data: field
		})),
		initComplete: function () {
                    // Setup - add a text input to each footer cell
                    this.api().columns().every(function () {
                        var column = this;
                        var input = $('<input type="text" placeholder="Search '+column.header().innerText+'" />')
                            .appendTo($(column.header()).empty())
                            .on('keyup change clear', function () {
                                if (column.search() !== this.value) {
                                    column.search(this.value).draw();
                                }
                            });
                    });
		}
	    });

            // Setup - add a text input to each header cell
            $('#data-table thead tr:eq(1) th').each( function (i) {
                var title = $(this).text();
                $(this).html('<input type="text" placeholder="Search '+title+'" />');

                $('input', this).on('keyup change', function () {
                    if (table.column(i).search() !== this.value) {
                        table
                            .column(i)
                            .search(this.value)
                            .draw();
                    }
                });
            });

	    // Add click event listener for rows
            $('#data-table tbody').on('click', 'tr', openRow(data, table));
        })
        .catch(error => console.error('Error loading the CSV file:', error));
});


// Return callback that can run when the user clicks a table
openRow = function(data, table) {
    return function () {
	var rowIdx = table.row(this).index();  // Index of the clicked row
	var rowData = table.row(this).data();      // Get the data of the clicked row

	var details = '<ul>';
        // Generate list items for each field
        data.meta.fields.forEach(function(field) {
            if (field === "Height") {
                // Add an input field for editing the Height
                details += '<li>' + field + ': <input type="text" id="edit-height" value="' + rowData[field] + '"></li>';
            } else {
                // Display other fields as read-only
                details += '<li>' + field + ': ' + rowData[field] + '</li>';
            }
	});
	details += '</ul>';
	
	$("#details-content").html(details);      // Set the content of the dialog
	$("#row-details").dialog({                // Open the dialog
            modal: true,
            width: 400,
            buttons: {
                "Save Changes": function() {
                    var updatedHeight = $('#edit-height').val();
                    rowData['Height'] = updatedHeight;  // Update the Height in rowData
		    console.log(rowIdx);
                    table.row(rowIdx).data(rowData).draw();  // Update the DataTable row
                    $(this).dialog("close");
                },
		Cancel: function() {
                    $(this).dialog("close");
		}
            }
	});
    };
}
