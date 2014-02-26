# d3.legend.js
# Original is (C) 2012 ziggy.jonsson.nyc@gmail.com
# This version is (C) 2013 Intridea & Mike Tierney
# Heavily modified by Mike Tierney <mike.tierney@intridea.com> for the D3 Fakebook library
# MIT license

window.D3Fakebook = {}

D3Fakebook.legend = (g) ->
  g.each(->
    g               = d3.select(this)
    items           = {}
    itemsComparison = {}
    svg             = d3.select(g.property("nearestViewportElement"))
    legendPadding   = g.attr("data-style-padding") or 5
    li              = g.selectAll(".legend-items").data([true])

    # FIXME: Won't render in IE8.
    li.enter().append('g').attr('class', 'legend-items')#.classed("legend-items", true)
    li.selectAll('g')

    svg.selectAll("[data-legend]").each(->
      self = d3.select(this)
      items[self.attr("data-legend")] = {
        pos   : self.attr("data-legend-pos") || this.getBBox().y,
        color : if self.attr("data-legend-color") != undefined then self.attr("data-legend-color") else (if self.style("fill") != 'none' then self.style("fill") else self.style("stroke")) # ewwwwwww...
      }
    )

    svg.selectAll("[data-legend-comparison]").each(->
      self = d3.select(this)
      itemsComparison[self.attr("data-legend-comparison")] = {
        pos   : self.attr("data-legend-pos") || this.getBBox().y,
        color : if self.attr("data-legend-color") != undefined then self.attr("data-legend-color") else (if self.style("fill") != 'none' then self.style("fill") else self.style("stroke")) # ewwwwwww...
      }
    )

    items = d3.entries(items)#.sort((a,b) -> a.value.pos-b.value.pos)
    itemsComparison = d3.entries(itemsComparison)#.sort((a,b) -> return a.value.pos-b.value.pos)

    if itemsComparison.length
      li2 = g.selectAll(".legend-items-comparison").data([true])
      li2.enter().append('g').attr('class', 'legend-items-comparison')#.classed("legend-items-comparison", true)
      li2.selectAll('g').attr('class', 'legend-items-comparison')

      li.selectAll("text")
        .data(items,(d)-> d.key)
        .call((d) -> d.enter().append("text"))
        .call((d) -> d.exit().remove())
        .attr("y",(d,i) -> (1.5*i)+"em")
        .attr("x","0em")
        .text((d) -> d.key)

      li.selectAll("line")
        .data(items, (d) -> d.key)
        .call((d) -> d.enter().append("line"))
        .call((d) -> d.exit().remove())
        .attr("y1", (d,i) -> (1.5*i)-0.4+"em")
        .attr("y2", (d,i) -> (1.5*i)-0.4+"em")
        .attr("x1",-0.5+"em")
        .attr("x2",-2.0+"em")
        .style("stroke", (d) -> d.value.color)
        .style("stroke-width", "4")

      li2.selectAll("text")
        .data(itemsComparison,(d) -> d.key)
        .call((d) -> d.enter().append("text"))
        .call((d) -> d.exit().remove())
        .attr("y", (d,i) -> (1.5*i)+"em")
        .attr("x", "0em")
        .text((d) -> d.key)


      li2.selectAll("line")
        .data(itemsComparison,(d) -> d.key)
        .call((d) -> d.enter().append("line"))
        .call((d) -> d.exit().remove())
        .attr("y1", (d,i) -> (1.5*i)-0.4+"em")
        .attr("y2", (d,i) -> (1.5*i)-0.4+"em")
        .attr("x1", -0.5+"em")
        .attr("x2", -2.5+"em")
        .style("stroke",(d) -> d.value.color)
        .style("stroke-width", "4")
        .style("stroke-dasharray", ('5, 5'))

    else
      li.selectAll("text")
        .data(items,(d) -> d.key)
        .call((d) -> d.enter().append("text"))
        .call((d) -> d.exit().remove())
        .attr("y", (d,i) -> (1.5*i)+"em")
        .attr("x","1em")
        .text((d) -> d.key)

      li.selectAll("circle")
        .data(items, (d) -> d.key)
        .call((d) -> d.enter().append("circle"))
        .call((d) -> d.exit().remove())
        .attr("cy", (d,i) -> (1.5*i)-0.4+"em")
        .attr("cx",-0.4+"em")
        .attr("r","0.4em")
        .style("fill", (d) -> d.value.color)

  )
  return g
