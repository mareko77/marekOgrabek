	$('#btnRun1').click(function() {

		$.ajax({
			url: "libs/php/threeApiApps.php",
			type: 'POST',
			dataType: 'json',
			data: {
				latitude: $('#lat').val(),
				longitude: $('#lng').val()
			},
			success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {

					$('#distance').html(result['data'][0]['distance']);
					$('#geonameId').html(result['data'][0]['geonameId']);
					$('#name').html(result['data'][0]['name']);

				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
	
	});


	