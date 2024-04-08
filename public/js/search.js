let autocomplete;
let autocomplete2;

function initAutocomplete(){
    var address = document.getElementById('DeparturePoint');
    autocomplete = new google.maps.places.Autocomplete(address,
    {
        componentRestrictions:{ 'country': ['GR']},
        fields: ['places_id', 'geometry', 'name']
    });
    var address2 = document.getElementById('Destination');
    autocomplete2 = new google.maps.places.Autocomplete(address2,
        {
            componentRestrictions:{ 'country': ['GR']},
            fields: ['places_id', 'geometry', 'name']
    });
}