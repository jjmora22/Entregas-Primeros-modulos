// DEFINO EL MARCO DE TRABAJO -- Width está ya definido de acuerdo al tamaño de la pantalla
width = 800
height = (500/800) * width // Lo hago para mantener la proporción
margin = {
    top: 10,
    bottom: 40,
    left: 60,
    right: 10
    }

data_count = {}
chgyear = 2018
Flagreset = 0
dataorigin = {}

// ---> Cuento los campeonatos por cada copa de cada selección
function CountYears(data2) {
    data_count = d3.nest()
    .key(function(d) {
        return d.winner;
    })
    .rollup(function(wins) {
        return wins.length;
    })
    .entries(data2);
    return(data_count)
}

function FilterExistWin (data2) {
    if ((data2.winner) !== "") {
        return true
    }
    else
        return false;
}

function FilterYearAbove (data2) {
    console.log("los datos que recibe FilterYearAbove son chgyear -->", chgyear, "y data2 -->", data2)
    if ((data2.year) <= chgyear) {
        return true
    }
    else
        return false;
}




function ReceiveValue(Value, data2) {
    chgyear = Value
    console.log("se recibe de manera correcta el valor chgyear del año en el slider --> ", chgyear)
    console.log("datos de data origin -->", dataorigin)
    console.log("datos en data2 son estos --> ", data2)
    console.log("datos de years -->", years)
    console.log("Es chgyear -> ", chgyear, "menor que el año mayor de data2 --> ", d3.max(data2.map(d => d.year)),"? --> ", chgyear < d3.max(data2.map(d => d.year)))

    data2 = dataorigin
    data2 = data2.filter(FilterExistWin)
    console.log("reseteo data2 -->", data2)
    data2 = data2.filter(FilterYearAbove) 
    console.log("lo convierto en el nuevo data2 --> ", data2)

    CountYears(data2)

// ---> defino el dominio:
    x.domain([0, d3.max(data_count.map(datum => datum.value))])
    y.domain(data2.map(d => d.winner))
      
// ---> dibujo los ejes:
    xAxisGroup.call(xAxis) 
    yAxisGroup.call(yAxis)

// ---> dibujo las barras
data_count = CountYears(data2)
console.log("este es el nuevo valor de data_count -->", data_count)

    elementGroup.selectAll("rect").data(data_count)
        .join("rect")
            .attr ("class", d => d.key)
            .attr("x",0)
            .attr("y", (d, i) => y(d.key))
            .attr("height", y.bandwidth())
            .transition()
            .duration(300)
            .attr("width", (d => d.value * 146))
            .attr("fill", function (d) {return (d.value == d3.max(data_count.map(datum => datum.value)) ? "red" : "darkgrey")})

// ---> coloco el número de copas que ha ganado cada selección al pasar el mouse sobre la tabla
    elementGroup.selectAll("text").data(data_count)
        .join("text")
            .attr ("class", "tooltiptext")
            .attr("x",d => d.value * 146 - 22)
            .attr("y", (d, i) => y(d.key) + y.bandwidth()/2 + 4)
            .attr("height", y.bandwidth())
            .attr("text-anchor", "middle")
            .attr("style:fill", "white")
            .attr("style:font-size", "10px")
            .transition()
            .duration(450) // <--- Quiero darle un pequeño retraso 
            .text(d => d.value)



}

 // INICIO AQUÍ ---> defino svg y grupos:
svg = d3.select("#chart")
    .append("svg")
        .attr("width", width)
        .attr("height", height)

elementGroup = svg.append("g").attr("id", "elementGroup")
    .attr("transform", `translate(${margin.left})`)
axisGroup = svg.append("g").attr("id", "axisGroup")
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
    console.log("Datos recibidos de data.csv --> ",data)

    data.map(d => {
        d.year = +d.year // Transformo los años a datos contínuos (lo requiero para el slider)
    })

    data2 = data
    dataorigin = data
    years = data2.map(d => d.year)
    slider(years, data2)
    data2 = data2.filter(FilterExistWin) // Borrar si no hubo mundial
    console.log("borrar mundiales no jugados", data2)
    console.log("Genero dataorigin para hacer el reset, cuando suba el slider -->", dataorigin)
    ReceiveValue(d3.max(years), data2)
})



// CHART END


// slider:
function slider(years, data2) {   
    console.log("compruebo que he recibido years bien en función slider -->", years)
    console.log("establezco el mínimo del slider en --> ", d3.min(years)) 
    console.log("establezco el máximo del slider en --> ", d3.max(years))
    console.log("marco un total de --> ", years.length, "saltos en el slider")
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años --> mínimo
        .max(d3.max(years))   // rango años --> mínimo
        .step(4)  // cada cuánto aumenta el slider
        .width(580)  // ancho de nuestro slider
        .ticks(years.length)  
        .default(years[years.length - 1])  // punto inicio de la marca
        .on('onchange', Year_Slider => { sliderTime.value()
            console.log("La función aún no está conectada con la gráfica")
            // conectar con la gráfica aquí
            console.log(Year_Slider)
            ReceiveValue(Year_Slider, data2)
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

