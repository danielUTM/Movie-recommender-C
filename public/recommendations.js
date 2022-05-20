
//Populates the movies
async function load_recommendation(){
    var e = 0.2;
    var randomGreedy = Math.random();
    // get rated films
    let ratedFilms = await getRatedFilms()
    $.get("/getRecommendations", function(result) {
        // Get highest rated cluster so we don't choose random film for epsilon greedy in this
        var cluster = result[0]["cluster"]
        //Seeing if it should explore with probability e
        // Don't Explore
        if (randomGreedy > e) {
            // Generate random number and ensure we don't get same film or rated film
            var random = Math.floor(Math.random() * (result.length));
            while (result[random]["title"] + ' - id: ' +result[random]['id'] === $('#m1Title').text() || ratedFilms.includes(result[random]['id'])) {
                var random = Math.floor(Math.random() * (result.length));
            }

            //Movie 1 Data
            $('#m1Title').html(result[random]["title"] + ' - id: ' +result[random]['id']);
            $('#m1Runtime').html( 'Runtime '+ result[random]["runtime"]+' mins');
            if(result[random]["budget"] == 0){
                $('#m1Budget').html('Budget: Unknown');
            }else{
                $('#m1Budget').html('Budget: ' + result[1]["budget"]);
            }
            if(result[random]["revenue"] == 0){
                $('#m1Revenue').html('Revenue: Unknown');
            }else{
                $('#m1Revenue').html('Revenue: ' + result[random]["revenue"]);
            }
            $('#m1AvgVote').html( 'Average Rating: ' + result[random]["vote_average"] + '/10');
            $('#m1VoteCount').html('Number of Ratings: ' + result[random]["vote_count"]);
            $('#m1Description').html(result[random]["description"]);
            $('#m1Image').attr("href", result[random]["imageURL"]);
            cutDescription();
        // Explore
        } else {
           $.get('/getAllMovies', function(result){
                console.log("explore")
                // Generate random number and ensure we don't get same film or rated film
                var random = Math.floor(Math.random() * (result.length));
                while (
                    result[random]["title"] + ' - id: ' + result[random]['id'] === $('#m1Title').text() 
                    || ratedFilms.includes(result[random]['id'])
                    || result[random]["cluster"] === cluster
                ) {
                 var random = Math.floor(Math.random() * (result.length));
                }

                $('#m1Title').html(result[random]["title"] + ' - id: ' +result[random]['id']);
                $('#m1Runtime').html( 'Runtime '+ result[random]["runtime"]+' mins');
                if(result[random]["budget"] == 0){
                    $('#m1Budget').html('Budget: Unknown');
                }else{
                    $('#m1Budget').html('Budget: ' + result[random]["budget"]);
                }
                if(result[random]["revenue"] == 0){
                    $('#m1Revenue').html('Revenue: Unknown');
                }else{
                    $('#m1Revenue').html('Revenue: ' + result[random]["revenue"]);
                }
                $('#m1AvgVote').html( 'Average Rating: ' + result[random]["vote_average"] + '/10');
                $('#m1VoteCount').html('Number of Ratings: ' + result[random]["vote_count"]);
                $('#m1Description').html(result[random]["description"]);
                $('#m1Image').attr("href", result[random]["imageURL"]);
                cutDescription();
           })
       }

       // Reset Likert scale
       document.getElementById("grForm").reset();
       document.getElementById("wtfForm").reset();

        //Incase you want to put the results in a table
        // var obj = result;
        // for(var i=0; i<obj.length; i++){
        //     var tr="<tr>";
        //     var td1="<td>"+obj[i]["id"]+"</td>";
        //     var td2="<td>"+obj[i]["title"]+"</td></tr>";
        // }
        // $("#place-here").append(tr+td1+td2);

    });
}

// Hide description partially
function cutDescription() {
    var cutoff = 50;
    var text = $('#m1Description').text();
    var rest = text.substring(cutoff);
    if (text.length > cutoff) {
        var space = rest.indexOf(' ');
        cutoff += Math.max(space, 0);
    }
    rest = text.substring(cutoff);
    var visibleText = $('#m1Description').text().substring(0, cutoff);
    $('#m1Description')
        .html(visibleText + ('<span>' + rest + '</span>'))
    $('#m1Description span').hide();
}

window.addEventListener('load', async function (event) {
    load_recommendation();
});

//get User Behaviour Database data
function getUserBehaviourDatabase(){
    $.get('/getUserBehaviour', function(result){
        console.log(result);
    })
}

//get Users Database data
function getUserDatabase(){
    $.get('/getUsers', function(result){
        console.log(result);
    })
}

function moreDesc() {
    $('#m1Description').find('span').toggle();
    $('#m1Description').find('a:last').hide();
    $('#m1SeeMore').text(function(i, text){
        return text === "See Less" ? "See More" : "See Less";
    }) 
}

// Get a list of ids of all the films the current user has rated
async function getRatedFilms () {
    var username = window.location.hash.substring(1)
    username = parseInt(username)
    // regex
    var searchPattern = new RegExp("^g[1-5]");
    ratedFilms = []

    const resultReq = await fetch('/getUserBehaviour')
    let result = await resultReq.json();
    for (const i of result) {
            if (i["userId"] === username & searchPattern.test(i["button"])) {
                firstM = i["button"].indexOf("m") + 1;
                ratedFilms.push(parseInt(i["button"].substring(firstM, i["button"].length)))
        }
    }
    
    return ratedFilms;
}

//Buttons to see explanations for movies
// Not currently used
$(function(){
    //Once Movie 1 button is clicked
    $('#m1btn').click(function(){
        //Shows the m1Explanation div
        $('#m1Explanation').toggle(500);
        //Changes the text of the button everytime it is clicked
        $(this).text($(this).text() == 'See Explanation' ? 'Hide Explanation' : 'See Explanation');
    });

    //Once Movie 2 button is clicked
    $('#m2btn').click(function(){
        //Shows the m1Explanation div
        $('#m2Explanation').toggle(500);
        //Changes the text of the button everytime it is clicked
        $(this).text($(this).text() == 'See Explanation' ? 'Hide Explanation' : 'See Explanation');
    });

    //Once Movie 3 button is clicked
    $('#m3btn').click(function(){
        //Shows the m1Explanation div
        $('#m3Explanation').toggle(500);
        //Changes the text of the button everytime it is clicked
        $(this).text($(this).text() == 'See Explanation' ? 'Hide Explanation' : 'See Explanation');
    });
})