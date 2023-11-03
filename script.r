source('./r_files/flatten_HTML.r')

#  Load R packages needed ####


#  Load R packages needed ####
library(ggplot2)
library(plotly)
library(reshape2)
library(htmlwidgets)
library(htmltools)
library(tidyverse)
library(colorspace)
library(dplyr)
library(viridis)
library(RColorBrewer)
library(data.table)


###### Sunburst function - to wrangle data into the subnurst hierarchy format ####
as.sunburstDF <- function(DF, valueCol = NULL){ require(data.table)
  colNamesDF <- names(DF)
  if(is.data.table(DF)){
    DT <- copy(DF)
  } else {
    DT <- data.table(DF, stringsAsFactors = FALSE)
  }
  DT[, root := "Total"]
  colNamesDT <- names(DT)
  if(is.null(valueCol)){
    setcolorder(DT, c("root", colNamesDF))
  } else {
    setnames(DT, valueCol, "values", skip_absent=TRUE)
    setcolorder(DT, c("root", setdiff(colNamesDF, valueCol), "values"))
  }
  hierarchyCols <- setdiff(colNamesDT, "values")
  hierarchyList <- list()  
  for(i in seq_along(hierarchyCols)){
    currentCols <- colNamesDT[1:i]
    if(is.null(valueCol)){
      currentDT <- unique(DT[, ..currentCols][, values := .N, by = currentCols], by = currentCols)
    } else {
      currentDT <- DT[, lapply(.SD, sum, na.rm = TRUE), by=currentCols, .SDcols = "values"]
    }
    setnames(currentDT, length(currentCols), "labels")
    hierarchyList[[i]] <- currentDT
  }
  hierarchyDT <- rbindlist(hierarchyList, use.names = TRUE, fill = TRUE)
  parentCols <- setdiff(names(hierarchyDT), c("labels", "values", valueCol))
  hierarchyDT[, parents := apply(.SD, 1, function(x){fifelse(all(is.na(x)),
                                                             yes = NA_character_, no = paste(x[!is.na(x)],sep = ":", collapse = " - "))}),.SDcols = parentCols]
  hierarchyDT[, ids := apply(.SD, 1, function(x){paste(x[!is.na(x)], collapse = " - ")}),
              .SDcols = c("parents", "labels")]
  hierarchyDT[, c(parentCols) := NULL]
  return(hierarchyDT)
}



 
df <-  data.frame(cbind(Layers,  Values)) # Values
 
#df <- df %>% select(1,2)
sunburstDFpos <- as.sunburstDF(df,valueCol =  rev(names(df))[1])  # valueCol = rev(names(df))[1])  #

###  get the data for the hover over values and labels ####
numcols <- as.integer(NROW(unique(sunburstDFpos$values) ))
numlabs <- as.integer(NROW(unique(sunburstDFpos$labels) ))
thelabs  <-  data.frame( thelabnames = unique(sunburstDFpos$labels))
thelabs  <- tibble::rowid_to_column(thelabs, "ID")
thelabsvals   <-   sunburstDFpos %>% select(labels,values)  %>%  group_by(labels) %>%
  slice(which.max(1 ))  %>% select(labels,groupvalues =  values)  #prop = 1
thelabs$labcol <- NA

###  set the color pallet ####
thelabs$labcol <- viridis(nrow(thelabs)) # colour_values(1:nrow(thelabs) ,  palette = "magma")
    #thelabs$labcol <- palette = "viridis", mypalette[thelabs$ID] # colour_values(1:nrow(thelabs) ,  palette = "magma")
    #, color = ~I(color)
thelabs<- thelabs %>% mutate (labcol =  ifelse(thelabnames == 'Total', "#FFFFFF",labcol ))    # #98fb98
thelabs<- thelabs %>% mutate (labcol =  ifelse(thelabnames == 'Total', "#FFFFFF",labcol ))    # #98fb98


####  Wrangle  the data to show the totals sections ####
sunburstDFpos <- sunburstDFpos %>% mutate( valuestotzero  = ifelse(labels == 'Total' ,0 ,values )  ,
                                           valuestotonly  = ifelse(labels == 'Total' ,values ,""))  %>%
  inner_join( thelabsvals , by = c("labels" = "labels" ))
sunburstDFpos <- sunburstDFpos %>%  mutate( thelabsvals = ifelse( ids == 'Total' ,0 ,groupvalues))  %>%
  arrange(-thelabsvals)
sunburstDFpos<-   inner_join( sunburstDFpos  ,  thelabs,  by = c( "labels" = "thelabnames"))
#sunburstDFpos <- sunburstDFpos %>%  mutate( labels = ifelse( labels == 'Total' ,"Total",labels))
sunburstDFpos <- sunburstDFpos %>%
  group_by(parents) %>%
  mutate(parentval = sum(values , na.rm= T))
sunburstDFpos <- sunburstDFpos %>%  mutate( percofparent= values / parentval )
##### plot the sunburst ####
 q <- plot_ly(data = sunburstDFpos, ids = ~ids, labels= ~labels, parents = ~parents,  text = ~valuestotzero,
             branchvalues = 'remainder',customdata = ~percofparent,
             hovertext = ~values, values= ~valuestotzero, type='sunburst',marker = list( colors = ~labcol )   ,
             insidetextorientation='radial' ,
            texttemplate="%{label}",
            hovertemplate="%{label} <br> %{value:#,.5s} <br> %{customdata:.1%}</b><extra></extra>"
            )   %>%  #percentParent percentEntry
  hide_colorbar() %>%
  layout (  grid = list(columns = 1, rows= 1), xaxis = list( zeroline = FALSE,  showline = FALSE,
                                                            showticklabels = FALSE,  showgrid = FALSE),
           yaxis = list( zeroline = FALSE,  showline = FALSE,
                         showticklabels = FALSE,  showgrid = FALSE),  margin(2, 2, 2, 2)  )

###  save as html widget
# q <-  plot_ly(sunburstDFpos,  x = df[,1], y = df[,2],  type = "bar" )
#q <-  plot_ly(data = sunburstDFpos, ids = ~ids, labels= ~labels, parents = ~parents, values= ~values, type='sunburst', branchvalues = 'total')
##https://laustep.github.io/stlahblog/posts/pbiviz.html#:~:text=In%20fact%2C%20pbiviz%20is%20not,restricted%20to%20render%20a%20htmlwidget.
############# Create and save widget ###############
p <- ggplotly(q)


internalSaveWidget(p, 'out.html')
####################################################


################ Reduce paddings ###################
#ReadFullFileReplaceString('out.html', 'out.html', ',"padding":[0-9]*,', ',"padding":0,')
####################################################

