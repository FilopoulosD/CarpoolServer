let destinationAutocomplete;
let departureAutocomplete;
let red = document.getElementById('red');

function initAutocomplete(){
    var destinationAddress = document.getElementById('DeparturePoint');
    destinationAutocomplete = new google.maps.places.Autocomplete(destinationAddress,
    {
        componentRestrictions:{ 'country': ['GR']},
        fields: ['places_id', 'geometry', 'name']
    });
    var departureAddress = document.getElementById('Destination');
    departureAutocomplete = new google.maps.places.Autocomplete(departureAddress,
        {
            componentRestrictions:{ 'country': ['GR']},
            fields: ['places_id', 'geometry', 'name']
    });
}