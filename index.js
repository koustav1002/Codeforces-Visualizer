const base_api_url="https://codeforces.com/api/";
let cresponse ;
let cdata ;
let ratingGraph;
let submissionGraph;
let tagsGraph;
let problemGraph;

async function getData(){
	// Getting Handle and checking if that is a valid one
	let handle = document.getElementById("handle").value;
	const api_url = 'https://codeforces.com/api/user.info?handles='+handle;
	const contest_url = "https://codeforces.com/api/user.rating?handle="+handle;
	const response = await fetch(api_url);
	const data = await response.json();
	
	document.getElementById("error").textContent = "";
	if(data.status!="OK") {
		document.getElementById("error").textContent = "Not a valid handle!";
		return;
	}
	document.getElementById("hiddendiv").style.display = "block";
	document.getElementById("userTable").innerHTML="";
	let name = "";
	if(typeof data.result[0].firstName!= "undefined") name = name+ data.result[0].firstName+" ";
	if(typeof data.result[0].lastName!= "undefined") name = name+ data.result[0].lastName;

	addTableRow("userTable","Name",name);
	if(typeof data.result[0].country != "undefined" )
		addTableRow("userTable","Country",data.result[0].country);
	addTableRow("userTable","Rating",data.result[0].rating);
	addTableRow("userTable","Max Rating",data.result[0].maxRating);
	addTableRow("userTable","Friend of",data.result[0].friendOfCount);
	addTableRow("userTable","Contribution",data.result[0].contribution );
	document.getElementById("dp").src = data.result[0].titlePhoto;
	
	// Asking Contest objects for rating chart
	cresponse = await fetch(contest_url);
	cdata = await cresponse.json();
	if(cdata.status == "OK"){
		changeRatingChart();
	}
	document.getElementById("contestTable").innerHTML="";
	let maxRank = -100000, minRank = 1000000;
	for(i=0;i<cdata.result.length;i++){
		maxRank = Math.max(maxRank, cdata.result[i].rank);
		minRank = Math.min(minRank, cdata.result[i].rank);
	}
	addTableRow("contestTable","Total Contest",cdata.result.length);
	addTableRow("contestTable","Best Rank",minRank);
	addTableRow("contestTable","Worst Rank",maxRank);
	addTableRow("contestTable","Rank",data.result[0].rank);
	addTableRow("contestTable","Max Rank",data.result[0].maxRank);
	
	const sresponse = await fetch(base_api_url+"user.status?handle="+handle);
	const submission_data = await sresponse.json();
	let count = submission_data.result.length;
	let ac = 0, ce = 0 ,wa = 0, tle = 0, rte = 0, mle = 0, others = 0;
	let ara = [], arac = [];
	let mxpr = 0;
	let strongTags = [], weakTags = [];
	
	for(i=0;i<count;i++){
		let ch = submission_data.result[i].problem.index;
		let ca = "A";
		// let dif=ch[0]-ca[0];
		let dif = ch.charCodeAt(0)-ca.charCodeAt(0);
		
		if( typeof ara[dif] == "undefined") {ara[dif] = 0; arac[dif] = 0;}
		ara[dif]++;
		
		let verdict = submission_data.result[i].verdict;
		if( verdict == "OK" ){
			ac++;
			arac[dif]++;
			if(dif>mxpr) mxpr = dif;
		}
		else if( verdict == "WRONG_ANSWER" ){wa++;}
		else if( verdict == "COMPILATION_ERROR") ce++;
		else if( verdict == "TIME_LIMIT_EXCEEDED") tle++;
		else if( verdict == "MEMORY_LIMIT_EXCEEDED") mle++;
		else if( verdict == "RUNTIME_ERROR") rte++;
		else others++;
		let tags = submission_data.result[i].problem.tags;
	
		if(verdict == "OK" ){
			strongTags = strongTags.concat(tags);
		}else{
			weakTags = weakTags.concat(tags);
		}
		
	}
	
	strongTags.sort();
	weakTags.sort();
	// console.log(strongTags.length);
	
	let toptenWeak = [], toptenStrong = [];
	let lasts = 0, lastw = 0;
	for(i = 1;i<strongTags.length;i++){
		if(strongTags[i]!=strongTags[i-1]){
			let x = i-lasts;
			let temp = [strongTags[i-1]+": "+x ,i-lasts];
			lasts = i;
			toptenStrong.push(temp);
		}
		if(weakTags[i]!=weakTags[i-1]){
			let x = i-lastw
			let temp = [weakTags[i-1]+": "+x,i-lastw];
			lastw = i;
			toptenWeak.push(temp);
		}
	}
	let dataTags = [["Type","Count"],["AC: "+ac,ac],["WA: "+wa,wa],["CE: "+ce,ce],["RTE: "+rte,rte],["MLE: "+mle,mle],["Others: "+others,others]];
	createDonutChart(dataTags,"submissionchart"); 
	
	let para = [["Tags","Solved"]];
	para = para.concat(toptenStrong);
	console.log(para[1][0]);
	createDonutChart(para,"donutchart");
	
	let datalabels4 = [];
	let datax4 = [];
	for(i = mxpr;i>=0;i--){
		if( typeof arac[i] == "undefined") arac[i] = 0;
		const character = String.fromCharCode(i+65);
		datalabels4.push(character);
		let tempe = [];
		datax4.push(arac[i]);
		//console.log(ara[i]);
	}
	createProblemChart(datalabels4,datax4);
	
}

function changeRatingChart(){
	if( typeof cdata == "undefined") return;
	
	const datalabels = [];
	const datax = [];
	
	let sstattus = "Contest Rating Changes";
	for(i=0;i<cdata.result.length;i++){
		datax.push(cdata.result[i].newRating);
		datalabels.push(i+1);
			
	}
	createratingchart(datalabels,datax,sstattus);
}

function createratingchart(datalabels,datax,sstatus){
	if(ratingGraph){
		ratingGraph.data.labels = datalabels;
		ratingGraph.data.datasets[0].data = datax;
		ratingGraph.data.datasets[0].label = sstatus;
		ratingGraph.update();
	}else {
		let ctx = document.getElementById('ratingChart').getContext('2d');
		ratingGraph = new Chart(ctx, {
			type: 'line',
			
			data: {
				labels: datalabels,
				datasets: [{
					label: sstatus,
					data: datax,
					fill: false,
					backgroundColor: 'rgba(0, 0, 0, 1)',
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 1
				}]
			}
		});
		ratingGraph.canvas.parentNode.style.width = '1000px';
	}
}

function createProblemChart(datalabels,datax){
	if(problemGraph){
		problemGraph.data.labels = datalabels;
		problemGraph.data.datasets[0].data = datax;
		problemGraph.update();
	} else{
		let ctx = document.getElementById('problemChart').getContext('2d');
		problemGraph = new Chart(ctx, {
			type: 'bar',
			
			data: {
				labels: datalabels,
				datasets: [{
					label: 'Problem Counts',
					data: datax,
					fill: false,
					backgroundColor: 'rgba(50, 102, 168, 1)',
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 1
				}]
			}
		});
	}
}

function createDonutChart(datatoshow,chartName){
	google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback(drawmChart);
      function drawmChart() {
        let data = google.visualization.arrayToDataTable(datatoshow);

        let tagOptions = {
			width: Math.max(600, $('.contents').width()),
			height: Math.max(600, $('.contents').width()) * 0.70,
			chartArea: { width: '80%', height: '70%' },
			is3D : true,
			legend: {
			  position: 'right',
			  alignment: 'center',
			},
			pieHole: 0.5,
			tooltip: {
			  text: 'percentage'
			},
			fontName: 'Roboto',
			
		  };

        let chart = new google.visualization.PieChart(document.getElementById(chartName));
        chart.draw(data, tagOptions);

	}
}
  
function addTableRow(name,data1,data2){
	let table = document.getElementById(name);

    // Create an empty <tr> element and add it to the 1st position of the table:
    let row = table.insertRow();

   // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    // Add some text to the new cells:
    cell1.innerHTML = data1;
    cell2.innerHTML = data2;
}
