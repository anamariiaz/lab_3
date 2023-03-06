//provide access token to Mapbox API 
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5hbWFyaWlheiIsImEiOiJjbGRtMTR5YmUwMjBqM3VrZDU0N2RmeTVuIn0.TtYMegWHD_9XSk_jO1jZFg'; 

//define maximum and minimum scroll bounds for the maps
const maxBounds = [
    [-79.8, 43.4], //SW coords
    [-78.8, 44] //NE coords
];

//define a constant variable "map" and assign it to a map created with the Mapbox API 
const map = new mapboxgl.Map({
    container: 'map', //ID for div where map will be embedded in HTML file
    style: 'mapbox://styles/anamariiaz/clex3wjhx000z01o2bsd76rsn', //link to style URL
    center: [-79.3, 43.765], //starting position [longitude, latitude]
    zoom: 10, //starting zoom
    bearing: -17.7, //angle rotation of map
	maxBounds: maxBounds //maximum and minimum scroll bounds
});

//add navigation controls to the map (zoom in, zoom out, and compass buttons) 
map.addControl(new mapboxgl.NavigationControl());

//add button to map which enters/exits full screen mode
map.addControl(new mapboxgl.FullscreenControl());

//assign 'geocoder' variable to a Mapbox geocoder (which allows searching of locations and zooms into searched locations on the map)
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca" //limit searchable locations to being within Canada
});

//add geocoder to map by embedding it within HTML element with "geocoder" id (such that its map location and style is specified by the latter)
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//specify events triggered by the loading of the "map" variable
map.on('load', () => {

    //add a geojson file source "bikeways" for Toronto bikeways
    map.addSource('bikeways', {
        type: 'geojson',
        data: 'https://anamariiaz.github.io/data/bikeways.geojson',
        'generateId': true
    });

    //add and style a layer of lines "bike" from the defined "bikeways" source
    map.addLayer({
        'id': 'bike',
        'type': 'line',
        'source': 'bikeways',
        'paint': {
            'line-width': 3,
            //specify the color of the lines based on the text contained within the "INFRA_HIGHORDER" data field (i.e. based on the bikeway type)
            'line-color': [
                'case',
                ['in', 'Bike Lane', ['get','INFRA_HIGHORDER']],
                'red',
                ['in', 'Cycle Track', ['get','INFRA_HIGHORDER']],
                'green',
                ['in', 'Multi-Use Trail', ['get','INFRA_HIGHORDER']],
                'blue',
                ['in', 'Sharrows', ['get','INFRA_HIGHORDER']],
                'orange',
                ['in', 'Park Road', ['get','INFRA_HIGHORDER']],
                '#5C4033',
                ['in', 'Signed Route', ['get','INFRA_HIGHORDER']],
                'purple',
                'black'
            ],
            //modify the opacity of lines based on the hover feature-state (i.e. change opacity of lines when hovered over)
            'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1, //change opacity of lines to 1 when hovered over
                0.5 //leave opacity of lines at 0.5 when not hovered over
            ]
        }
    });

    //add a geojson file source "bike_parking" for Toronto outdoor bike parking stations
    map.addSource('bike_parking', {
        type: 'geojson',
        data: 'https://anamariiaz.github.io/data_2/bicycle_parking_map_data.geojson',
        'generateId': true,
        //cluster the data to limit the symbology on the map at low zoom levels
        cluster: true,
        clusterMaxZoom: 14, //maximum zoom at which points cluster
        clusterRadius: 50 //distance over which points cluster
    });

    //add and style a layer of circles "bike_parking_clustered" from the defined "bike_parking" source
    map.addLayer({
        'id': 'bike_parking_clustered',
        'type': 'circle',
        'source': 'bike_parking',
        //only show circles when there is more than 1 bike parking station within a radius of 50 at a given zoom level (which is < max zoom level of clustering)
        filter: ['has', 'point_count'],
        'paint': {
            'circle-color': '#11b4da',
            //specify the radius of the circles based on whether the number of bike parking stations within a radius of 50 at a given zoom level is <10, 10-20, 20-50, 50-100 or >100
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                10,
                10,
                15,
                20,
                17,
                50,
                20,
                100,
                25
            ]
        }
    });

    //add and style a layer of symbols "cluster-count" from the defined "bike_parking" source
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'bike_parking',
        //only show text when there is more than 1 bike parking station within a radius of 50 at a given zoom level (which is < max zoom level of clustering)
        filter: ['has', 'point_count'],
        layout: {
            //specify text as the number of bike parking stations within a radius of 50 at a given zoom level
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            //allow overlap of other text layers
            'text-allow-overlap': true,
            'text-ignore-placement': true
        }
    });

    //add and style a layer of circles "bike_parking_unclustered" from the defined "bike_parking" source
    map.addLayer({
        id: 'bike_parking_unclustered',
        type: 'circle',
        source: 'bike_parking',
        //only show circles when there is 1 bike parking station within a radius of 50 at a given zoom level (or when zoom level >= max zoom level of clustering)
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 5,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    //add a geojson file source "bike_shops" for Toronto outdoor bike shops stations
    map.addSource('bike_shops', {
        type: 'geojson',
        data: 'https://anamariiaz.github.io/data_2/bicycle_shops_data.geojson',
        'generateId': true,
        //cluster the data to limit the symbology on the map at low zoom levels
        cluster: true,
        clusterMaxZoom: 14, //maximum zoom at which points cluster
        clusterRadius: 50 //distance over which points cluster
    });
        
    //add and style a layer of circles "bike_shops_clustered" from the defined "bike_shops" source
    map.addLayer({
        'id': 'bike_shops_clustered',
        'type': 'circle',
        'source': 'bike_shops',
        //only show text when there is more than 1 bike shops within a radius of 50 at a given zoom level (which is < max zoom level of clustering)
        filter: ['has', 'point_count'],
        'paint': {
            'circle-color': '#FFB6C1',
            //specify the radius of the circles based on whether the number of bike shops within a radius of 50 at a given zoom level is <10, 10-20, 20-50, 50-100 or >100
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                10,
                10,
                15,
                20,
                17,
                50,
                20,
                100,
                25
            ]
        }
    });
        
    //add and style a layer of symbols "cluster-count_shops" from the defined "bike_shops" source
    map.addLayer({
        id: 'cluster-count_shops',
        type: 'symbol',
        source: 'bike_shops',
        //only show text when there is more than 1 bike shops within a radius of 50 at a given zoom level (which is < max zoom level of clustering)
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            //allow overlap of other text layers
            'text-allow-overlap': true,
            'text-ignore-placement': true
        }
    });
        
    //add and style a layer of circles "bike_shops_unclustered" from the defined "bike_shops" source
    map.addLayer({
        id: 'bike_shops_unclustered',
        type: 'circle',
        source: 'bike_shops',
        //only show circles when there is 1 bike shops within a radius of 50 at a given zoom level (or when zoom level >= max zoom level of clustering)
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#FFB6C1',
            'circle-radius': 5,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
        

    //change cursor to a pointer when mouse hovers over 'bike' layer
    map.on('mouseenter', 'bike', () => {
        map.getCanvas().style.cursor = 'pointer'; 
    });
    
    //change cursor back when mouse leaves 'bike' layer
    map.on('mouseleave', 'bike', () => {
        map.getCanvas().style.cursor = ''; 
    });
    
    //specify events triggered by clicking on the 'bike' layer
    map.on('click', 'bike', (e) => {
        //if the installation year is not 0, declare and add to map a popup at the longitude-latitude location of click which contains the street name, type, installation year, and length of clicked bikeway, as well as a link to the data source
        if (e.features[0].properties.INSTALLED!==0){
            new mapboxgl.Popup() 
                .setLngLat(e.lngLat) 
                .setHTML("Street Name: " + e.features[0].properties.STREET_NAME + "<br>" + "Type: " + e.features[0].properties.INFRA_HIGHORDER
                + "<br>" + "Installation Year: " + e.features[0].properties.INSTALLED + "<br>" + "Length: " + Math.round(e.features[0].properties.Shape__Length) + "m" 
                + "<br>" + '<a target=”_blank” href="https://open.toronto.ca/dataset/bikeways/">Bikeways Source</a>') 
                .addTo(map); 
        } 
        //if the installation year is 0, declare and add to map the same popup as above but with installation year = 'None'
        else {
            new mapboxgl.Popup() 
                .setLngLat(e.lngLat) 
                .setHTML("Street Name: " + e.features[0].properties.STREET_NAME + "<br>" + "Type: " + e.features[0].properties.INFRA_HIGHORDER
                + "<br>" + "Installation Year: None" + "<br>" + '<a target=”_blank” href="https://open.toronto.ca/dataset/bikeways/">Bikeways Source</a>') 
                .addTo(map);    
        }
    });

    //change cursor to a pointer when mouse hovers over 'bike_parking_unclustered' layer
    map.on('mouseenter', 'bike_parking_unclustered', (e) => {
            map.getCanvas().style.cursor = 'pointer'; 
    });
    
    //change cursor back when mouse leaves 'bike_parking_unclustered' layer
    map.on('mouseleave', 'bike_parking_unclustered', (e) => {
            map.getCanvas().style.cursor = ''; 
    });
    
    //specify events triggered by clicking on the 'bike_parking_unclustered' layer
    map.on('click', 'bike_parking_unclustered', (e) => {
        //declare and add to map a popup at the longitude-latitude location of click which contains the address and capacity of clicked bike parking station, as well as a link to the data source
        new mapboxgl.Popup() 
            .setLngLat(e.lngLat) 
            .setHTML("Address: " + e.features[0].properties.ADDRESS_FULL + "<br>" + "Capacity: " + e.features[0].properties.BICYCLE_CAPACITY+ "<br>" + '<a target=”_blank” href="https://open.toronto.ca/dataset/bicycle-parking-high-capacity-outdoor/">Bike Parking Source</a>') //Use click event properties to write text for popup
            .addTo(map); 
    });

    //change cursor to a pointer when mouse hovers over 'bike_shops_unclustered' layer
    map.on('mouseenter', 'bike_shops_unclustered', (e) => {
        map.getCanvas().style.cursor = 'pointer'; 

    });

    //change cursor back when mouse leaves 'bike_shops_unclustered' layer
    map.on('mouseleave', 'bike_shops_unclustered', (e) => {
            map.getCanvas().style.cursor = ''; 
    });

    //specify events triggered by clicking on the 'bike_shops_unclustered' layer
    map.on('click', 'bike_shops_unclustered', (e) => {
        //declare and add to map a popup at the longitude-latitude location of click which contains the name, address, phone number, email, and information on whether rentals are available of clicked bike shop, as well as a link to the data source
        new mapboxgl.Popup() 
            .setLngLat(e.lngLat) 
            .setHTML("Name: " + e.features[0].properties.NAME + "<br>" + "Address: " + e.features[0].properties.ADDRESS_FULL + 
            "<br>" + "Phone #: " + e.features[0].properties.PHONE + "<br>" + "Email: " + e.features[0].properties.EMAIL + 
            "<br>" + "Rentals: " + e.features[0].properties.RENTAL + "<br>" + 
            '<a target=”_blank” href="https://open.toronto.ca/dataset/bicycle-shops/">Bike Shops Source</a>') 
            .addTo(map); 
    });

    let bikeID = null; //assign initial value of 'bikeID' variable as null

    //specify events triggered by moving mouse over the 'bike' layer
    map.on('mousemove', 'bike', (e) => {
        //enter conditional if mouse hovers over at least one feature of the 'bike' layer
        if (e.features.length > 0) { 
            //if bikeID IS NOT NULL - i.e. a feature was being hovered over immediately prior to another - set hover feature-state of the this feature back to false to reset its original opacity (before continuing to move and highlight the next hovered line)
            if (bikeID !== null) { 
                map.setFeatureState(
                    { source: 'bikeways', id: bikeID },
                    { hover: false }
                );
            }
            //set 'bikeID' variable to the id of the 'bike' layer feature being hovered over
            bikeID = e.features[0].id; 
            //change the hover feature-state to "true" for the feature of the 'bike' layer being hovered over (to change its opacity)
            map.setFeatureState(
                { source: 'bikeways', id: bikeID },
                { hover: true } 
            );
        }
    });

    //specify events triggered by mouse leaving the 'bike' layer
    map.on('mouseleave', 'bike', () => { 
        //change the hover feature-state to "false" for the feature of the 'bike' layer that was previously hovered over (to reset its original opacity) and re-initialize bikeID to null
        if (bikeID !== null) {
            map.setFeatureState(
                { source: 'bikeways', id: bikeID },
                { hover: false }
            );
        }
        bikeID = null;
    });   

});

//specify events triggered by clicking the button HTML element with id "returnbutton"
document.getElementById('returnbutton').addEventListener('click', () => {
    //move the map view back to original state
    map.flyTo({
        center: [-79.3, 43.765], //starting position [longitude, latitude]
        zoom: 10, //starting zoom
        bearing: -17.7, //starting bearing
        essential: true
    });
});

//assign variable 'legendlabels' to a list of labels for the bikeways legend
const legendlabels = [
    'Bike Lanes',
    'Cycle Tracks',
    'Multi-Use Trails',
    'Sharrows',
    'Park Roads', 
    'Signed Routes'
];

//assign variable 'legendcolours' to a list of colours for the bikeways legend
const legendcolours = [
    'red',
    'green',
    'blue',
    'orange',
    '#5C4033',
    'purple'
];

//assign 'legend' variable to HTML element with 'legend' id
const legend = document.getElementById('legend');

//loop through the legend labels in the 'legendlabels' variable
legendlabels.forEach((label, i) => {
    //assign 'color' variable to the corresponding color of the 'legendcolours' variable
    const color = legendcolours[i];
    //assign 'item' variable to a created 'section'
    const item = document.createElement('div'); 
    //assign 'key' variable to a created 'span' (i.e. space into which content can be inserted)
    const key = document.createElement('span'); 
    //specify the class of 'key' span as 'legend-key' such that its style is defined by the latter in css
    key.className = 'legend-key'; 
    //specify the background color of 'key' span using the 'color' variable
    key.style.backgroundColor = color; 
    //assign 'value' variable to a created 'span' (i.e. space into which content can be inserted)
    const value = document.createElement('span'); 
    //insert text into 'value' span from the 'legendlabels' list being looped through
    value.innerHTML = `${label}`; 
    //add 'key' span to the created section 'item'
    item.appendChild(key); 
    //add 'value' span to the created section 'item'
    item.appendChild(value); 
    //add 'item' section into the HTML element assigned to 'legend' variable
    legend.appendChild(item); 
});

//specify events triggered by clicking the button HTML element with id "legend-bar"
document.getElementById('legend-bar').addEventListener('click', (e) => {
    //if the legend is collapsed, expand it (i.e. change its display) and update the button label to 'collapse'
    if (document.getElementById('legend-bar').textContent==="Expand") {
        document.getElementById('legend-bar').innerHTML="Collapse"
        legend.style.display = 'block';
    } 
    //if the legend is expanded, collapse it (i.e. remove its display) and update the button label to 'expand'
    else if (document.getElementById('legend-bar').textContent==="Collapse") {
        document.getElementById('legend-bar').innerHTML="Expand"
        legend.style.display = 'none';
    }
});

//specify events triggered by changing the checkbox value of the checkbox HTML element with id "layercheck"
document.getElementById('layercheck').addEventListener('change', (e) => {
    //toggle visibility of 'bike_parking_unclustered' layer to on/off depending on whether checkbox is checked/unchecked
    map.setLayoutProperty(
        'bike_parking_unclustered',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
    map.setLayoutProperty(
        //toggle visibility of 'bike_parking_clustered' layer to on/off depending on whether checkbox is checked/unchecked
        'bike_parking_clustered',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
    map.setLayoutProperty(
        //toggle visibility of 'cluster-count' layer to on/off depending on whether checkbox is checked/unchecked
        'cluster-count',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

//specify events triggered by changing the checkbox value of the checkbox HTML element with id "layercheck_shops"
document.getElementById('layercheck_shops').addEventListener('change', (e) => {
    //toggle visibility of 'bike_shops_unclustered' layer to on/off depending on whether checkbox is checked/unchecked
    map.setLayoutProperty(
        'bike_shops_unclustered',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
    //toggle visibility of 'bike_shops_clustered' layer to on/off depending on whether checkbox is checked/unchecked
    map.setLayoutProperty(
        'bike_shops_clustered',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
    //toggle visibility of 'cluster-count_shops' layer to on/off depending on whether checkbox is checked/unchecked
    map.setLayoutProperty(
        'cluster-count_shops',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

//assign 'label_parking' variable to HTML element with 'label' id
const label_parking = document.getElementById('label');
//assign 'item_parking' variable to a created 'section'
const item_parking = document.createElement('div'); 
//assign 'key_parking' variable to a created 'span' (i.e. space into which content can be inserted)
const key_parking = document.createElement('span'); 
//specify the class of 'key_parking' span as 'label-key' such that its style is defined by the latter in css
key_parking.className = 'label-key';
//specify the background color of 'key_parking' span
key_parking.style.backgroundColor = '#11b4da';
//assign 'value_parking' variable to a created 'span' (i.e. space into which content can be inserted)
const value_parking = document.createElement('span'); 
//insert text into 'value_parking' span
value_parking.innerHTML = 'Bike Parking'
//add 'key_parking' span to the created section 'item_parking'
item_parking.appendChild(key_parking); 
//add 'value_parking' span to the created section 'item_parking'
item_parking.appendChild(value_parking); 
//add 'item_parking' section into the HTML element assigned to 'label_parking' variable
label_parking.appendChild(item_parking); 

//assign 'label_shops variable to HTML element with 'label_shops' id
const label_shops = document.getElementById('label_shops');
//assign 'item_shops' variable to a created 'section'
const item_shops = document.createElement('div');
//assign 'key_shops' variable to a created 'span' (i.e. space into which content can be inserted)
const key_shops = document.createElement('span'); 
//specify the class of 'key_shops' span as 'label-key' such that its style is defined by the latter in css
key_shops.className = 'label-key'; 
//specify the background color of 'key_shops' span
key_shops.style.backgroundColor = '#FFB6C1'; 
//assign 'value_shops' variable to a created 'span' (i.e. space into which content can be inserted)
const value_shops = document.createElement('span');
//insert text into 'value_shops' span
value_shops.innerHTML = 'Bike Shops'
//add 'key_shops' span to the created section 'item_shops'
item_shops.appendChild(key_shops); 
//add 'value_shops' span to the created section 'item_shops'
item_shops.appendChild(value_shops); 
//add 'item_shops' section into the HTML element assigned to 'label_shops' variable
label_shops.appendChild(item_shops); 

//specify events triggered by changing value of the dropdown HTML element with id "list"
document.getElementById('list').addEventListener('change', (e) => {
    //if the selected dropdown element has index 1 (i.e. is second), filter the 'bike' layer to show only bikeways with length>1000m
    if (document.getElementById("list").selectedIndex===1) {
        map.setFilter('bike', ['>', ['get', 'Shape__Length'], 1000]);
    } 
    //if the selected dropdown element has index 2 (i.e. is third), filter the 'bike' layer to show only bikeways with length<1000m
    else if (document.getElementById("list").selectedIndex===2) {
        map.setFilter('bike', ['<', ['get', 'Shape__Length'], 1000]);
    } 
    //if the selected dropdown element has index 0 (i.e. is first), remove the 'bike' layer filter to show all bikeways
    else if (document.getElementById("list").selectedIndex===0) {
        map.setFilter('bike', null);
    } 
        
});




