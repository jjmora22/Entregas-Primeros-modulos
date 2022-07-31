// DEFINO EL MARCO DE TRABAJO -- Width está ya definido de acuerdo al tamaño de la pantalla
width = 800
height = (500/800) * width // Lo hago para mantener la proporción
margin = {
    top: 10,
    bottom: 40,
    left: 60,
    right: 10
    }

// ---> defino svg y grupos:
svg = d3.select("#chart")
    .append("svg")
        .attr("width", width)
        .attr("height", height)

elementGroup = svg.append("g").attr("id", "elementGroup")
    .attr("transform", `translate(${margin.left})`)
const axisGroup = svg.append("g").attr("id", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup")
    .attr("transform", `translate(${margin.left}, ${height - margin.top - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup")
    .attr("transform", `translate(${margin.left})`)


//definir escala:
x = d3.scaleLinear()
    .range([0, (width - margin.left - margin.right)])
y = d3.scaleBand()
    .range([(height - margin.top - margin.bottom), 0]).padding(0.10)

// CHART START 
// ---> defino ejes:
xAxis = d3.axisBottom().scale(x).ticks(5)
yAxis = d3.axisLeft().scale(y)

// ---> Ingreso los datos de trabajo
d3.csv("data.csv").then(data => {
    console.log(data)

    data.map(d => {
    //    d.year = +d.year // Transformo los años a datos contínuos (lo requiero para el slider)
    })


    data2 = data
/*
    function FilterSelectedYear (val) {
        if ((data2.year) > val) {
            return true
        }
        else
            return false;
    }

    data2 = data2.filter(FilterSelectedYear) // <----- Este es el filtro del año según el slider
*/
    function FilterExistWin (val) {
        if ((data2.winner) !== "") {
            return true
        }
        else
            return false;
    }



    data2 = data2.filter(FilterExistWin) // <--- Este es el primer filtro de la base, donde quito los años que no hubo ganador

// ---> Cuento los campeonatos por cada copa de cada selección
var data_count = d3.nest()
    .key(function(d) {
        return d.winner;
    })
    .rollup(function(wins) {
        return wins.length;
    })
    .entries(data2);

console.log(data_count)

// ---> defino el dominio:
    x.domain([0, d3.max(data_count.map(datum => datum.value))])
    y.domain(data2.map(d => d.winner))
      
// ---> dibujo los ejes:
    xAxisGroup.call(xAxis) 
    yAxisGroup.call(yAxis)

// ---> dibujo las barras
elementGroup.selectAll("rect").data(data_count)
    .join("rect")
        .attr ("class", d => d.key)
        .attr("x",0)
        .attr("y", (d) => y(d.key))
        .attr("width", (d => d.value * 800 / d3.max(data_count.map(datum => datum.value))))
        .attr("height", y.bandwidth())
        .attr("fill", function (d) {return (d.value == d3.max(data_count.map(datum => datum.value)) ? "blue" : "darkgrey")})

// ---> coloco el número de copas que ha ganado cada selección al pasar el mouse sobre la tabla
elementGroup.selectAll("text").data(data_count)
    .join("text")
        .attr ("class", "tooltiptext")
        .text(d => d.value)
        .attr("x",d => (d.value * 800 / d3.max(data_count.map(datum => datum.value))) - 22)
        .attr("y", (d) => y(d.key) + y.bandwidth()/2 + 4)
        .attr("height", y.bandwidth())
        .attr("text-anchor", "middle")
        .attr("style:fill", "white")
        .attr("style:font-size", "10px")
})



// CHART END

// slider:
function slider() {    
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(data2.map(datum => datum.year)))  // rango años
        .max(d3.max(data2.map(datum => datum.year)))
        .step(4)  // cada cuánto aumenta el slider
        .width(580)  // ancho de nuestro slider
        .ticks(d3.set(data2.map(datum => datum.year).size()))  
        .default([d3.max(data2.map(datum => datum.year)) - 1])  // punto inicio de la marca
        .on('onchange', val => { sliderTime.value()
            console.log("La función aún no está conectada con la gráfica")
            // conectar con la gráfica aquí
            FilterSelectedYear(val);
        });

        var gTime = d3
        .select('div#slider-time')  // div donde lo insertamos
        .append('svg')
        .attr('width', width * 0.8)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);

        d3.select('p#value-time').text(sliderTime.value());
    } 
    