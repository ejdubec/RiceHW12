function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`).then(function(sampleData) {
    let metaObj = sampleData;

    // Use d3 to select the panel with id of `#sample-metadata`
    let metaPanel = d3.select('#sample-metadata');

    // Use `.html("") to clear any existing metadata
    metaPanel.html('');

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    let tbody = metaPanel.append('table').append('tbody');
    Object.entries(metaObj).forEach(function([category, val]) {
      let trow = tbody.append('tr');
      trow.append('td').text(`${category}:`);
      trow.append('td').text(`${val}`);
    });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  // sampleData is in form {'':[']}
  d3.json(`/samples/${sample}`).then(function(sampleData) {

    // @TODO: Build a Bubble Chart using the sample data
    // otu_ids for x and color, sample_values for y and size, otu_labels for text values
    // it seems to convert the otu_id into a red value from 0 to 255, possibly scaling value into rgba?
    let traceB = {
      x : sampleData['otu_ids'],
      y : sampleData['sample_values'],
      text : sampleData['otu_labels'],
      mode : 'markers',
      type : 'scatter',
      marker : {
        size : sampleData['sample_values'],
        color : sampleData['otu_ids']
      }
    };

    let dataB = [traceB];

    let layoutB = {
      xaxis : {
        title : 'OTU_id'
      }
    };

    Plotly.newPlot('bubble', dataB, layoutB);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    // otu_ids for labels, otu_labels for hovertext, sample_values for values

    // sort first, then slice (sort modifies in place, slice returns shallow copy)
    // I can't think of a way to do it while it's stored like that, so I'll have to change it
    let sampleArray = [];
    for (let i = 0; i < sampleData['otu_ids'].length; i++) {
      sampleArray.push({
      'id' : sampleData['otu_ids'][i], 
      'val' : sampleData['sample_values'][i], 
      'lab' : sampleData['otu_labels'][i]});
    }
    sampleArray.sort((id1, id2) => id2.val - id1.val);
    let tenMostVal = sampleArray.slice(0, 10);
    let tenIds = [];
    let tenValues = [];
    let tenLabels = [];

    for (let i = 0; i < 10; i++) {
      tenIds.push(tenMostVal[i].id);
      tenValues.push(tenMostVal[i].val);
      tenLabels.push(tenMostVal[i].lab);
    }

//    console.log(tenMostVal);

    let trace = {
      labels: tenIds,
      values: tenValues,
      hoverinfo: tenLabels,
      type: 'pie'
    };

    let data = [trace];
/*
    let layout = {
    }
*/
    Plotly.newPlot('pie', data);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
