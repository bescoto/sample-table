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
            $('#data-table tbody').on('click', 'tr', function () {
                const rowIdx = table.row(this).index(); // Get the index of the clicked row
                const rowData = table.row(this).data(); // Get the data of the clicked row
                alert(`Row index: ${rowIdx + 1}\nName: ${rowData["Name"]}`)
            });
        })
        .catch(error => console.error('Error loading the CSV file:', error));
});
