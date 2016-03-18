import arcpy, json, os

'''
GP Parameters
0 - outFile
1 - xMin
2 - yMin
3 - xMax
4 - yMax
5 - layerInfos
    '{"layer1": {"visible": true, "opacity": 0.5},"layer2": {"visible": true, "opacity": 0.5}}'
6 - stringReplaces {key: text, key2: text}
'''

arcpy.env.overwriteOutput = True

# variables
currentDir = os.path.dirname(os.path.realpath(__file__))
startReplace = "{|"
endReplace = "|}"
mxdPath = os.path.join(currentDir, 'Print.mxd')
outFileName = 'district-map.pdf'
scratch = arcpy.env.scratchWorkspace
if not scratch:
    scratch = "C:/Temp"
outPDF = scratch + '\\' + outFileName
xMin = arcpy.GetParameterAsText(1)
yMin = arcpy.GetParameterAsText(2)
xMax = arcpy.GetParameterAsText(3)
yMax = arcpy.GetParameterAsText(4)
layerInfos = json.loads(arcpy.GetParameterAsText(5))
stringReplaces = json.loads(arcpy.GetParameterAsText(6))

mxd = arcpy.mapping.MapDocument(mxdPath)

dataFrame = arcpy.mapping.ListDataFrames(mxd)[0]

# update layer properties
lyrs = arcpy.mapping.ListLayers(mxd)
for l in lyrs:
     if l.name in layerInfos:
         info = layerInfos[l.name]
         l.visible = info['visible']
         l.transparency = 100 - info['opacity'] * 100;
         
# update layout text
elements = arcpy.mapping.ListLayoutElements(mxd, "TEXT_ELEMENT")
for el in elements:
    txt = el.text
    if startReplace in txt:
        start = txt.find(startReplace)
        end = txt.find(endReplace)
        key = txt[start + len(startReplace):end]
        if key in stringReplaces:
            el.text = txt.replace(startReplace + key + endReplace, stringReplaces[key])

# update extent
extent = dataFrame.extent

extent.XMin = xMin
extent.YMin = yMin
extent.XMax = xMax
extent.YMax = yMax

dataFrame.extent = extent

arcpy.mapping.ExportToPDF(mxd, outPDF)

arcpy.SetParameterAsText(0, outPDF)

print "done"