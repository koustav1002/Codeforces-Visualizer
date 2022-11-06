var container=document.getElementById("container")
let cdata ;
let ratingGraph;
//console.log(container)
function changeRatingChart(){
	if( typeof cdata == "undefined") return;
	
	const datalabels = [];
		const datax = [];
		const state = "newRating";
		var sstattus = "";
		for(i=0;i<cdata.result.length;i++){
			if(state == "newRating"){
				datax.push(cdata.result[i].newRating);
				sstatus = "Contest Rating Changes";
			}
			else if(state == "changedRating"){
				sstatus = "Contest Changed Rating";
				if(i == 0) datax.push(cdata.result[i].newRating-1500);
				else datax.push(cdata.result[i].newRating-cdata.result[i].oldRating);
			}
			else {
				datax.push(cdata.result[i].rank);
				sstatus = "Contest Rank";
			}
			//console.log(cdata.result[i].newRating-cdata.result[i].oldRating);
			datalabels.push(i+1);
			
		}
		createratingchart(datalabels,datax,sstatus);
}
function createratingchart(datalabels,datax,sstatus){
	if(ratingGraph){
		ratingGraph.data.labels = datalabels;
		ratingGraph.data.datasets[0].data = datax;
		ratingGraph.data.datasets[0].label = sstatus;
		ratingGraph.update();
	}else {
		var ctx = document.getElementById('ratingChart').getContext('2d');
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
			},
			options: {
				fullWidth: true,
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: false
						}
					}]
				}
			}
		});
		ratingGraph.canvas.parentNode.style.width = '1000px';
	}
}

async function getuserinfo(){
    let input=document.getElementById("profile").value
    console.log("1")
    console.log(input)
    const api_url = 'https://codeforces.com/api/user.info?handles='+input;
    let res= await fetch(api_url)
    if(res.status!==200)
    {console.log(res.status);}
    
    let data=await res.json();
    console.log(data.result[0]);

    const contest_url = "https://codeforces.com/api/user.rating?handle="+input;
    cresponse = await fetch(contest_url);
	cdata = await cresponse.json();
	if(cdata.status == "OK"){
        document.getElementById("card").style.display="block";
		changeRatingChart();
	}


    let html=``
    html+=` 
    <div class="user_info">
            <table class="info">
                <tbody>
                    <tr>
                        <td>Username</td>
                        <td> : </td>
                        <td>${input}</td>
                    </tr>
                    <tr>
                        <td>Rating</td>
                        <td> : </td>
                        <td>${data.result[0].rating}</td>
                        <td>Max Rating</td>
                        <td> : </td>
                        <td>${data.result[0].maxRating}</td>
                    </tr>
                    <tr>
                        <td>Contribution</td>
                        <td> : </td>
                        <td>${data.result[0].contribution}</td>
                    </tr>
                </tbody>
            </table>
          </div>`;

    container.innerHTML=html;
    
}

let btn=document.getElementById("button")
btn.addEventListener('click',getuserinfo)

// async function getuserrating(){
//     let ip=document.getElementById("profile").value
//     console.log(ip)
//     const url='https://codeforces.com/api/user.rating?handles='+ip;
//     let res1=await fetch(url)

//     let data=await res.json();
//     console.log(data.result[0]);
// }