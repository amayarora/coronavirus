var dates = ["1/22/20", "1/23/20", "1/24/20", "1/25/20", "1/26/20", "1/27/20", "1/28/20", "1/29/20", "1/30/20", "1/31/20", "2/1/20", "2/2/20", "2/3/20", "2/4/20", "2/5/20", "2/6/20", "2/7/20", "2/8/20", "2/9/20", "2/10/20", "2/11/20", "2/12/20", "2/13/20", "2/14/20", "2/15/20", "2/16/20", "2/17/20", "2/18/20", "2/19/20", "2/20/20", "2/21/20", "2/22/20", "2/23/20", "2/24/20", "2/25/20", "2/26/20", "2/27/20", "2/28/20", "2/29/20", "3/1/20", "3/2/20", "3/3/20", "3/4/20", "3/5/20", "3/6/20", "3/7/20", "3/8/20", "3/9/20", "3/10/20", "3/11/20", "3/12/20", "3/13/20", "3/14/20", "3/15/20", "3/16/20", "3/17/20", "3/18/20", "3/19/20", "3/20/20", "3/21/20", "3/22/20", "3/23/20", "3/24/20", "3/25/20", "3/26/20", "3/27/20", "3/28/20", "3/29/20", "3/30/20", "3/31/20", "4/1/20", "4/2/20", "4/3/20", "4/4/20", "4/5/20", "4/6/20", "4/7/20", "4/8/20", "4/9/20"]

var width = 1000;
var height = 1000;

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)

var projection = d3.geoAlbersUsa()

var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var path = d3.geoPath()
    .projection(projection)
    
var color_helper = d3.scaleLog([1, 1000, 1000000], ["#fcde9c", "#e34f6f", "#7c1d6f"])
function color(num) {
    if (num == 0 || num == null) return "white"
    return color_helper(num)
}

var legend = svg.selectAll("g.legend")
    .data([0, 1, 10, 100, 1000, 10000, 100000, 1000000])
    .enter()
    .append("g")
    .attr("class", "legend");

var ls_w = 73, ls_h = 20;
		 
legend.append("rect")
    .attr("x", function(d, i){ return width - (i*ls_w) - ls_w;})
    .attr("y", 550)
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return color(d); })
    .style("opacity", 0.8);

labels = ["0", "1", "10", "100", "1000", "10000", "100000", "1000000"]
legend.append("text")
    .attr("x", function(d, i){ return width - (i*ls_w) - ls_w;})
    .attr("y", 590)
    .text(function(d, i){ return labels[i]; });

var legend_title = "Number of coronavirus cases";

svg.append("text")
    .attr("x", 417)
    .attr("y", 540)
    .attr("class", "legend_title")
    .text(function(){return legend_title});

function load(us, data) {
    data = new Map(data)

    new_york = [36081, 36005, 36047, 36085]
    new_york.forEach(d => {
        data.set(d, data.get(36061))
    });
    
    counties = svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("id", function (d) { return "id " + d.id })

    svg.append("path")
        .datum(topojson.feature(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);
    
    function update(key){
        slider.property("value", key);
        d3.select(".date").text(dates[key]);
        counties.style("fill", function(d) {
                if (data.get(d.id)) {
                    return color(data.get(d.id)[dates[key]])
                }
                return color(0)
            })
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);
                tooltip.html(
                    "<p><strong>" + data.get(d.id).name + "</strong><br>" + data.get(d.id)[dates[key]] + " case" + (data.get(d.id)[dates[key]] == 1 ? "" : "s") + "</p>")
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

                var line = tooltip
                    .append("svg")
                        .attr("width", 300)
                        .attr("height", 300)
                    .append("g")
                        .attr("transform", "translate(50, 50)");
                
                dat = []
                for (id in dates) {
                    dat.push({"x": id, "y": data.get(d.id)[dates[id]]})
                }
                
                var x = d3.scaleLinear()
                    .domain([0, dates.length - 1])
                    .range([0, 200])

                line.append("g")
                    .attr("transform", "translate(0, 200)")
                    .call(d3.axisBottom(x).tickFormat((d, i) => dates[d]))
                    .selectAll(".tick text")
                    .style("text-anchor", "end")
                    .attr("transform", "rotate(-45) translate(-6, -10)")
                    
                var y = d3.scaleLinear()
                    .domain([0, d3.max(dat, function(d) {
                        return parseInt(d.y)
                    })])
                    .range([200, 0])

                line.append("g")
                    .call(d3.axisLeft(y))

                line.append("path")
                    .datum(dat)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(function(a) { return x(a.x) })
                        .y(function(a) { return y(a.y) })
                    )
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(250)
                    .style("opacity", 0);
            });
    }

    var slider = d3.select(".slider")
        .append("input")
            .attr("type", "range")
            .attr("min", 0)
            .attr("max", dates.length - 1)
            .attr("step", 1)
            .on("input", function() {
                var date = this.value;
                update(date);
            });
    
    update(dates.length - 1)
}

d3.json("us.json").then(function(us) {
    d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv", function(d) {
        ret = {'name': d["Combined_Key"]}
        dates.forEach(function (date) {
            ret[date] = d[date]
        })
        return [+d.FIPS, ret]
    }).then(function(data) {
        load(us, data)
    })
})