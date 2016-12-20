var zwsid = "X1-ZWz1f67wou01e3_376md";
var request = new XMLHttpRequest();
var value = "<tr><th>No</th><th>Address</th><th>Zestimate</th></tr>";
var count = 0;
var map;
var marker;
var address_label;

//Function to clear the textbox
function clearData(){
  document.getElementById("address").value = "";
  address_label.close();
}

//Sets up the map and sets the inital position of marker 
function initialize () {
  var id = document.getElementById('map');
    map = new google.maps.Map(id, {
        center: {lat: 32.75, lng: -97.13},
        zoom: 17
        });
    marker = new google.maps.Marker({
      position: {lat: 32.75, lng: -97.13},
      map: map,
      title: 'my_marker',
      draggable:true
      });

    //Adding information about the address and zestimate to the map
    address_label = new google.maps.InfoWindow({
          content: "Address : Central Arlington, Arlington, TX, USA"
          });
    address_label.open(map,marker);

    //Adding the functionality to find zestimate when clicked on map
    map.addListener('click', function(click_pos) {
      
      var geocoder = new google.maps.Geocoder();        
      geocoder.geocode({
        latLng: click_pos.latLng
        }, function(responses) {  
          if (responses != null)
          {
            document.getElementById('address').value = responses[0].formatted_address;
            sendRequest(); 
          }
          
        }); 
     
      });
    
}

//Displays the address and zestmate to the specified output location on the webpage
function displayResult () {
    
    var xml = request.responseXML.documentElement;

    //Handles cases when the address is not valid or zestimate is unavailable
    if(xml.getElementsByTagName("message")[0].getElementsByTagName("code")[0].innerHTML != 0 )
    {
      return;
    }
    
    var _address = xml.getElementsByTagName("request")[0].getElementsByTagName("address")[0].innerHTML;
    var _citystatezip = xml.getElementsByTagName("request")[0].getElementsByTagName("citystatezip")[0].innerHTML;
    var _zestimate_value = xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0].innerHTML;
    
    if(_zestimate_value == 0)
    {
      return;
    }
    count++;    
    marker.setMap(null);
    value = value + "<tr><td>" + count + "</td>";
    value = value + "<td>" + _address + " " + _citystatezip + "</td>";
    value = value + "<td>$" + _zestimate_value + "</td></tr>";
    document.getElementById("output").innerHTML = value;
    geocode(_address + " " +_citystatezip,_zestimate_value);
}

//Function invoked on button click
function sendRequest () {

    var complete_address = document.getElementById("address").value;
    var split_address = complete_address.split(",");
    var address = split_address[0];
    var city = split_address[1];
    var state = split_address[2];
    var zipcode = split_address[3];
    
    request.open("GET","proxy.php?zws-id="+zwsid+"&address="+address+"&citystatezip="+city+"+"+state+"+"+zipcode);
    request.withCredentials = "true";
    request.onreadystatechange = function(){
      if (request.readyState == 4) {
        displayResult();
      }
    };
    request.send(null);
}

//To locate the address from a click on map
function geocode(loc,val)
{
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': loc}, function(results, status) {

    if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      var new_pos = new google.maps.LatLng(latitude,longitude);
        marker = new google.maps.Marker({
              position: new_pos,
              map: map,
              });
        map.panTo(new_pos);
        address_label = new google.maps.InfoWindow({
          content: "Address : " + loc + "<br>Zestimate : $" + val
          });
        address_label.open(map,marker);
          } 
    }); 
}
