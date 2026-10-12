const projection = d3.geoMercator().fitSize([width, height], geojsonData);
const path = d3.geoPath().projection(projection);

svg.selectAll("path")
  .data(geojsonData.features)
  .join("path")
  .attr("d", path)
  .attr("fill", d => REGION_COLORS[PROVINCE_REGION_MAP[d.properties.name]])
  .on("mouseover", showTooltip)
  .on("mouseout", hideTooltip)
  .on("click", onProvinceClick);
