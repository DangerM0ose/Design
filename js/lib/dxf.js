// Turn off debugging messages
var debug = false

function debugLog(msg) {
    if (debug) {
        //console.log("DXF.js: " + msg)
    }
}

function degrees2radians(degrees) { //why wont this import from geometryUtils?
    return degrees * Math.PI / 180;
};

function DXF(data, Scene) {

    //debugLog("fileio.js - processDXF")

    this.line = "";
    this.lines = data.split('\n');
    this.lineNum = 0;
    this.scene = Scene;
    this.processed = 0
}

DXF.prototype.getDXFLine = function () {
    this.line = this.lines[this.lineNum].replace(/\s+/, "");
    this.lineNum = this.lineNum + 1;
    if (Math.round((this.lineNum / this.lines.length) * 100) > this.processed) {
        this.processed = Math.round((this.lineNum / this.lines.length) * 100)
        console.log("Progress:" + this.processed + "%")
    }
}

DXF.prototype.previewNextLine = function () {
    //Read the next available line - NOTE: getDXFLine increments this.LineNum, therefore this.lineNum is the next line.
    return this.lines[this.lineNum].replace(/\s+/, "");
}

DXF.prototype.processData = function () {

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();

        switch (this.line) {

            case "$CLAYER":
                //Current layer name
                //debugLog("Found " + this.line)
                var clayer = this.readHeader(8);
                if (clayer) {
                    //console.log("clayer:" + clayer)
                    clayer = clayer;
                }
                break;

            case "$LIMMIN":
                //X, Y drawing extents lower-left corner (in WCS)
                //debugLog("Found " + this.line)
                break;

            case "$LIMMAX":
                //X, Y drawing extents upper-right corner (in WCS)
                //debugLog("Found " + this.line)
                break;

            case "$FILLETRAD":
                //Fillet radius
                //debugLog("Found " + this.line)
                break;

            case "$MEASUREMENT":
                //Sets drawing units: 0 = English; 1 = Metric
                //debugLog("Found " + this.line)
                break;

            case "$ORTHOMODE":
                //Ortho mode on if nonzero
                //debugLog("Found " + this.line)
                break;

            case "$ANGDIR":
                //1 = Clockwise angles, 0 = Counterclockwise
                //debugLog("Found " + this.line)
                break;

            case "$CELWEIGHT":
                //Lineweight of new objects
                //debugLog("Found " + this.line)
                break;

            case "$CEPSNTYPE":
                //Plotstyle type of new objects:
                //0 = PlotStyle by layer
                //1 = PlotStyle by block
                //2 = PlotStyle by dictionary default
                //3 = PlotStyle by object ID/handle
                //debugLog("Found " + this.line)
                break;

            case "$ENDCAPS":
                //Lineweight endcaps setting for new objects:
                //0 = none; 1 = round; 2=angle; 3=square
                //debugLog("Found " + this.line);
                break;

            case "$MEASUREMENT":
                break;

            case "AcDbBlockBegin":
                break;

            case "0":
                break;

            case "SECTION":
                //debugLog("Found " + this.line)
                break;

            case "TABLE":
                //debugLog("Found " + this.line)
                break;

            case "LAYER":
                //console.log("Found " + this.line)
                this.readLayer();
                break;

            case "BLOCKS":
                //debugLog("Found " + this.line)
                break;

            case "BLOCK":
                //debugLog("Found " + this.line)
                break;

            case "ENDSEC":
                //debugLog("Found " + this.line)
                break;

            case "VPORT":
                //debugLog("found " + this.line)
                this.readVPort();
                break;

            case "EOF":
                //debugLog("Found " + this.line)
                return;

                //
                ////////// ENTITIES //////////
                // Listed in alphabetical order

            case "ARC":
                //debugLog("Found " + this.line)
                this.readArc();
                break;

            case "ARCALIGNEDTEXT":
                //debugLog("Found " + this.line)
                //this.readArcAlignedText();
                break;

            case "CIRCLE":
                //debugLog("Found " + this.line)
                this.readCircle();
                break;

            case "DIMENSION":
                //debugLog("Found " + this.line)
                //this.readDimension();
                break;

            case "ELLIPSE":
                //debugLog("Found " + this.line)
                this.readEllipse();
                break;

            case "IMAGE":
                //debugLog("Found " + this.line)
                //this.readImage();
                break;

            case "LINE":
                //debugLog("Found " + this.line)
                this.readLine();
                break;

            case "LWPOLYLINE":
                //debugLog("Found " + this.line)
                this.readLwpolyline();
                break;

            case "MTEXT":
                //debugLog("Found " + this.line)
                //this.readText();
                break;

            case "POINT":
                //debugLog("Found " + this.line)
                this.readPoint();
                break;

            case "POLYLINE":
                //debugLog("Found " + this.line)
                this.readPolyline();
                break;

            case "SPLINE":
                //debugLog("Found " + this.line)
                this.readSpline();
                break;

            case "TEXT":
                //debugLog("Found " + this.line)
                //this.readText();
                break;
        }
    }
    //Finished reading entities. Request repaint. 
    //TODO: dxf shouldn't access the app, it should work as an external lib. 

}

DXF.prototype.readHeader = function (groupCode) {

    while (this.lineNum < this.lines.length) {
        this.getDXFLine();
        var n = parseInt(this.line);
        switch (n) {
            case groupCode:
                this.getDXFLine();
                //debugLog("Group Code " + groupCode + ": " + this.line);
                return this.line;
            case 9:
                return;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}


DXF.prototype.readLayer = function () {

    var name = "";
    //var handle = "";
    var flags = 0;
    var colour = "#ffffff";
    var lineType = "Continuous";
    var lineWeight = "Default";
    var plotting = true;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line); //what if its not an int? (layername or handle)
        //debugLog("readLine: " + n)
        switch (n) {
            case 0:
                // next item found, so finish with line

                //console.log(name, colour)
                var layer = {
                    name: name,
                    flags: flags,
                    colour: colour,
                    lineType: lineType,
                    lineWeight: lineWeight,
                    plotting: plotting
                }

                if (name) {
                    LM.addLayer(layer)
                }
                return;
            case 2: // Layer name follows
                this.getDXFLine();;
                //debugLog("Layer name: " + this.line);
                name = this.line;
                break;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();
                //debugLog("Line Type: " + this.line);
                lineType = this.line;
                break;
            case 62:
                // color index
                this.getDXFLine();
                //colour = getHexColour(Number(this.line));
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 70:
                //Standard flags (bit-coded values):
                //1 = Layer is frozen; otherwise layer is thawed.
                //2 = Layer is frozen by default in new viewports.
                //4 = Layer is locked.
                //16 = If set, table entry is externally dependent on an xref.
                //32 = If this bit and bit 16 are both set, the externally dependent xref has been successfully resolved.
                //64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files.)
                this.getDXFLine();
                //debugLog("Flags:" + this.line);
                flags = Number(this.line);
                break;
            case 100:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 39:
                this.getDXFLine();
                //debugLog("DXF Readline 39");
                break;
            case 210:
                this.getDXFLine();
                //debugLog("DXF Readline 210");
                break;
            case 220:
                this.getDXFLine();
                //debugLog("DXF Readline 220");
                break;
            case 230:
                // skip the next line
                this.getDXFLine();
                break;
            case 330:
                // Plotting
                this.getDXFLine();
                //debugLog("Plotting: " + this.line);
                plotting = Number(this.line);
                break;
            case 370:
                // Line weight
                this.getDXFLine();
                //debugLog("Line Weight: " + this.line);
                lineWeight = this.line;
                break;
            case 390:
                // skip the next line
                this.getDXFLine();
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }

}

DXF.prototype.readLine = function () {

    //Create the points required for a line
    var points = new Array();
    var pointStart = new Point();
    var pointEnd = new Point();
    var colour = "BYLAYER";
    var layer = "0"

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line); //what if its not an int? (layername or handle)
        //debugLog("readLine: " + n)
        switch (n) {
            case 0:
                // next item found, so finish with line
                //Push the points to the points array and pass it to the Scene
                points.push(pointStart); //TO DO: Check the points are valid before they are pushed.
                points.push(pointEnd);

                var line = {
                    points: points,
                    colour: colour,
                    layer: layer
                }

                addToScene("Line", line)
                return;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();
                //debugLog(this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("Layer name: " + this.line);
                layer = this.line;
                break;
            case 10:
                // start x
                this.getDXFLine();
                pointStart.x = this.line;
                //debugLog("startx: " + this.line);
                break;
            case 20:
                // start y
                this.getDXFLine();
                pointStart.y = this.line;
                //debugLog("starty: " + this.line);
                break;
            case 30:
                // start z
                this.getDXFLine();
                //debugLog("startz: " + this.line);
                break;
            case 11:
                // end x
                this.getDXFLine();
                pointEnd.x = this.line;
                //debugLog("endx: " + this.line);
                break;
            case 21:
                // end y
                this.getDXFLine();
                pointEnd.y = this.line;
                //debugLog("endy: " + this.line);
                break;
            case 31:
                // end z
                this.getDXFLine();
                //debugLog("endz: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 100:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 39:
                this.getDXFLine();
                //debugLog("DXF Readline 39");
                break;
            case 210:
                this.getDXFLine();
                //debugLog("DXF Readline 210");
                break;
            case 220:
                this.getDXFLine();
                //debugLog("DXF Readline 220");
                break;
            case 230:
                // skip the next line
                this.getDXFLine();
                break;
            default:
                // skip the next line
                //this.getDXFLine();
                break;
        }
    }

}


DXF.prototype.readCircle = function () {

    //Create the points required for a circle
    var points = new Array();
    var pointCentre = new Point();
    var pointRadius = new Point();
    var colour = "BYLAYER";
    var layer = "0"

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("readCircle: " + n)
        switch (n) {
            case 0:
                // next item found, so finish with Circle
                //Push the points to the points array and pass it to the Scene
                points.push(pointCentre); //TO DO: Check the points are valid before they are pushed.
                points.push(pointRadius);
                //alsoAddToScene("Circle", points, colour);

                var circle = {
                    points: points,
                    colour: colour,
                    layer: layer
                }

                addToScene("Circle", circle)

                return;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();;
                //debugLog(this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();;
                //debugLog("Layer name: " + this.line);
                layer = this.line;
                break;
            case 10:
                // centre x
                this.getDXFLine();
                //debugLog("centre x: " + this.line);
                pointCentre.x = Number(this.line);
                break;
            case 20:
                // centre y
                this.getDXFLine();
                //debugLog("centre y: " + this.line);
                pointCentre.y = Number(this.line);
                break;
            case 30:
                // centre z
                this.getDXFLine();
                //debugLog("centre z: " + this.line);
                break;
            case 40:
                // radius
                this.getDXFLine();
                //debugLog("radius: " + this.line);
                pointRadius.x = Number(pointCentre.x) + Number(this.line);
                //debugLog("\npointRadius " + pointRadius.x)
                pointRadius.y = pointCentre.y;
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog(this.line);
                colour = getHexColour(Number(this.line));
                break;
            case 100:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 39:
                this.getDXFLine();
                //debugLog("DXF Readline 39");
                break;
            case 210:
                this.getDXFLine();
                //debugLog("DXF Readline 210");
                break;
            case 220:
                this.getDXFLine();
                //debugLog("DXF Readline 200");
                break;
            case 230:
                // skip the next line
                this.getDXFLine();;
                break;
            default:
                // skip the next line
                //this.getDXFLine();;
                break;
        }

    }

}


DXF.prototype.readPoint = function () {

    var colour = "BYLAYER";
    var layer = "0"

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("readPoint: " + n)

        switch (n) {
            case 0:
                // next item found, so finish with Point
                return;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();;
                //debugLog(this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("Layer name: " + this.line);
                layer = this.line;
                break;
            case 10:
                // start x
                this.getDXFLine();
                //debugLog("Start x: " + this.line);
                break;
            case 20:
                // start y
                this.getDXFLine();
                //debugLog("Start y: " + this.line);
                break;
            case 30:
                // start z
                this.getDXFLine();
                //debugLog("Start Z: " + this.line);
                break;

            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: " + this.line);
                colour = getHexColour(Number(this.line));
                break;

            case 100:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 39:
                this.getDXFLine();
                //debugLog("DXF Readline 39");
                break;
            case 210:
                this.getDXFLine();
                //debugLog("DXF Readline 210");
                break;
            case 220:
                this.getDXFLine();
                //debugLog("DXF Readline 220");
                break;
            case 230:
                // skip the next line
                this.getDXFLine();
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}

DXF.prototype.readArc = function () {

    //Create the points required for an Arc
    var points = new Array();
    var point_centre = new Point();
    var colour = "BYLAYER";
    var layer = "0"
    // var point_start = new Point();
    // var point_end = new Point();

    var start_angle = 0;
    var end_angle = 0;
    var radius = 0;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("readArc: " + n)

        switch (n) {
            case 0:
                // next item found, so finish with arc

                var point_start = new Point(point_centre.x + (radius * Math.cos(start_angle)), point_centre.y + (radius * Math.sin(start_angle)));
                var point_end = new Point(point_centre.x + (radius * Math.cos(end_angle)), point_centre.y + (radius * Math.sin(end_angle)));

                //Push the points to the points array and pass it to the Scene
                points.push(point_centre); //TO DO: Check the points are valid before they are pushed.
                points.push(point_start);
                points.push(point_end);
                //alsoAddToScene("Arc", points, colour);

                var arc = {
                    points: points,
                    colour: colour,
                    layer: layer
                }

                addToScene("Arc", arc)

                return;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();;
                //debugLog(this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("Layer name: " + this.line);
                layer = this.line;
                break;
            case 10:
                // centre x
                this.getDXFLine();
                point_centre.x = Number(this.line);
                //debugLog("centre X: " + this.line);
                break;
            case 20:
                // centre y
                this.getDXFLine();
                point_centre.y = Number(this.line);
                //debugLog("centre y: " + this.line);
                break;
            case 30:
                // centre z
                this.getDXFLine();
                //debugLog("centre z: " + this.line);
                break;
            case 40:
                // radius
                this.getDXFLine();
                radius = Number(this.line);
                //debugLog("radius: " + this.line);
                break;
            case 50:
                // start angle
                this.getDXFLine();
                start_angle = degrees2radians(Number(this.line));
                //debugLog("start angle: " + this.line);
                break;
            case 51:
                // end angle
                this.getDXFLine();
                end_angle = degrees2radians(Number(this.line));
                //debugLog("end angle: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 100:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 39:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 210:
                this.getDXFLine();
                //debugLog("DXF Readline 100");
                break;
            case 220:
                // skip the next line
                this.getDXFLine();
                break;
            case 230:
                //Z extrusion direction for arc
                this.getDXFLine();
                //debugLog("z extrusion: " + this.line);
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}

DXF.prototype.readEllipse = function () {

    var points = new Array();
    var point_centre = new Point();
    var point_major = new Point();
    var colour = "BYLAYER";
    var layer = "0"

    var ratio = 0;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)

        switch (n) {
            case 0:
                // next item found, so finish with Ellipse

                point_major = point_major.add(point_centre)
                var angle = point_centre.angle(point_major);
                var distance = point_centre.distance(point_major);
                var point_minor = new Point();
                point_minor.x = point_centre.x + (distance * ratio)
                point_minor.y = point_centre.y
                point_minor = point_minor.rotate(point_centre, angle + (Math.PI / 2))

                //Push the points to the points array and pass it to the Scene
                points.push(point_centre); //TO DO: Check the points are valid before they are pushed.
                //points.push(point_second);
                points.push(point_major);
                points.push(point_minor);

                var ellipse = {
                    points: points,
                    colour: colour,
                    layer: layer
                }

                addToScene("Ellipse", ellipse)

                //alsoAddToScene("Ellipse", points, colour);

                return;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();;
                //debugLog(this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("layer: " + this.line);
                layer = this.line;
                break;
            case 10:
                // centre x
                this.getDXFLine();
                point_centre.x = Number(this.line);
                //debugLog("centre x: " + this.line);
                break;
            case 20:
                // centre y
                this.getDXFLine();
                point_centre.y = Number(this.line);
                //debugLog("centre y: " + this.line);
                break;
            case 30:
                // centre z
                this.getDXFLine();
                //debugLog("centre z: " + this.line);
                break;
            case 11:
                // major x
                this.getDXFLine();
                point_major.x = Number(this.line);
                //debugLog("major x: " + this.line);
                break;
            case 21:
                // major y
                this.getDXFLine();
                point_major.y = Number(this.line);
                //debugLog("major y: " + this.line);
                break;
            case 31:
                // major z
                this.getDXFLine();
                //debugLog("major z: " + this.line);
                break;
            case 40:
                // ratio
                this.getDXFLine();
                ratio = this.line;
                //debugLog("ratio: " + this.line);
                break;
            case 41:
                // start
                this.getDXFLine();
                //debugLog("start: " + this.line);
                break;
            case 42:
                // end
                this.getDXFLine();
                //debugLog("end: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 100:
                //debugLog("DXF Readline 100");
                this.getDXFLine();
                break;
            case 39:
                //debugLog("DXF Readline 39");
                this.getDXFLine();
                break;
            case 210:
                //debugLog("DXF Readline 210");
                this.getDXFLine();
                break;
            case 220:
                //debugLog("DXF Readline 220");
                this.getDXFLine();
                break;
            case 230:
                // skip the next line
                this.getDXFLine();
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}

DXF.prototype.readVertex = function () {

    var vertex = new Point();
    //debugLog("In VERTEX");
    var colour = "BYLAYER";
    var layer = "0"

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)

        switch (n) {
            case 0:
                this.lineNum = this.lineNum - 1; // read one line too many.  put it back.
                return vertex;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("Layer: " + this.line);
                layer = this.line;
                break;
            case 10:
                // x
                this.getDXFLine();
                vertex.x = Number(this.line);
                //debugLog("x: " + this.line);
                break;
            case 20:
                // y
                this.getDXFLine();
                vertex.y = Number(this.line);
                //debugLog("y: " + this.line);
                break;
            case 30:
                // z
                this.getDXFLine();
                //debugLog("z: " + this.line);
                break;
            case 40:
                // Starting width (optional; default is 0)
                this.getDXFLine();
                //debugLog("Starting Width: " + this.line);
                break;
            case 41:
                // Ending width (optional; default is 0)
                this.getDXFLine();
                //debugLog("Ending Width: " + this.line);
                break;
            case 42:
                // Bulge (optional; default is 0).
                this.getDXFLine();
                //debugLog("Bulge: " + this.line);
                break;
            case 42:
                // Curve fit tangent direction
                this.getDXFLine();
                //debugLog("Curve fit tangent direction: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 70:
                this.getDXFLine();
                //debugLog("Flags: " + this.line);
                break;
            case 100:
                this.getDXFLine();
                //debugLog("Subclass marker: " + this.line);
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}



DXF.prototype.readPolyline = function () {

    var points = new Array();
    var colour = "BYLAYER";
    var layer = "0"
    var vertex_found = false;
    var flags;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)

        switch (n) {
            case 0:
                // next item found

                //debugLog("Preview Next Line: " + this.previewNextLine())

                if (this.previewNextLine() === "VERTEX") {
                    // The next line in the DXF file is a vertex
                    this.getDXFLine(); //This Line will be === VERTEX

                    if (!vertex_found) {
                        vertex_found = true;
                    }

                    //debugLog("In Polyline - handle VERTEX");
                    points.push(this.readVertex());

                } else if (this.previewNextLine() === "SEQEND") {
                    //debugLog("In Polyline - handle SEQEND");
                    this.getDXFLine();
                } else if (vertex_found) {

                    if (flags === 1) {
                        // Flag 1 signifies a closed shape. Copy the first point to the last index.
                        var point = new Point();
                        point.x = points[0].x;
                        point.y = points[0].y;
                        points.push(point);
                    }

                    //debugLog("Polyline points: " + points.length)

                    var polyline = {
                        points: points,
                        colour: colour,
                        layer: layer

                    }

                    addToScene("Polyline", polyline)
                    //alsoAddToScene("Polyline", points, colour)
                    return;
                }
                break;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();;
                //debugLog(this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("layer: " + this.line);
                layer = this.line;
                break;
            case 10:
                // x
                this.getDXFLine();
                //debugLog("x: " + this.line);
                break;
            case 20:
                // y
                this.getDXFLine();
                //debugLog("y: " + this.line);
                break;
            case 30:
                // z
                this.getDXFLine();
                //debugLog("z: " + this.line);
                break;
            case 39:
                // Thickness (optional; default = 0)
                this.getDXFLine();
                //debugLog("Global Width: " + this.line);
                break;
            case 40:
                // Starting width (multiple entries; one entry for each vertex) (optional; default = 0; multiple entries). Not used if constant width (code 43) is se
                this.getDXFLine();
                //debugLog("Start Width: " + this.line);
                break;
            case 41:
                // End width (multiple entries; one entry for each vertex) (optional; default = 0; multiple entries). Not used if constant width (code 43) is set
                this.getDXFLine();
                //debugLog("End Width: " + this.line);
                break;
            case 70:
                // flags
                this.getDXFLine();
                flags = Number(this.line);
                //debugLog("flags: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 100:
                this.getDXFLine();
                //debugLog("Subclass marker: " + this.line);
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}


DXF.prototype.readLwpolyline = function () {

    var points = new Array();
    var x_array = new Array();
    var y_array = new Array();
    var vertices = 0; // store the number of points contained in the LWpolyline
    var colour = "BYLAYER";
    var layer = "0"
    var flags;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)

        switch (n) {
            case 0:
                // next item found

                if (vertices > 0 && x_array.length === vertices && y_array.length === vertices) {

                    for (var i = 0; i < vertices; i++) {

                        var point = new Point();
                        point.x = x_array[i];
                        point.y = y_array[i];

                        points.push(point);

                        ////debugLog(i);
                        ////debugLog(x_array[i], y_array[i]);
                    }

                    if (flags === 1) {
                        // Flag 1 signifies a closed shape. Copy the first point to the last index.
                        var point = new Point();
                        point.x = points[0].x;
                        point.y = points[0].y;
                        points.push(point);
                    }

                    var polyline = {
                        points: points,
                        colour: colour,
                        layer: layer
                    }

                    addToScene("Polyline", polyline)

                    //alsoAddToScene("Polyline", points, colour) //////////////////////////////////////////////  LWPOLYLINE is being represented as a POLYLINE in DESIGN. Does this affect anything?
                }

                return;
            case 5: // handle name follows
                this.getDXFLine();;
                //debugLog("Handle name: " + this.line);
                break;
            case 6: // line style name follows
                this.getDXFLine();;
                //debugLog("line Style: " + this.line);
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("layer: " + this.line);
                layer = this.line;
                break;
            case 10:
                // x
                this.getDXFLine();
                x_array.push(Number(this.line));
                //debugLog("x: " + this.line);
                break;
            case 20:
                // y
                this.getDXFLine();
                y_array.push(Number(this.line));
                //debugLog("y: " + this.line);
                break;
            case 30:
                // z
                this.getDXFLine();
                //debugLog("z: " + this.line);
                break;
            case 40:
                // Starting width (multiple entries; one entry for each vertex) (optional; default = 0; multiple entries). Not used if constant width (code 43) is se
                this.getDXFLine();
                //debugLog("Start Width: " + this.line);
                break;
            case 41:
                // End width (multiple entries; one entry for each vertex) (optional; default = 0; multiple entries). Not used if constant width (code 43) is set
                this.getDXFLine();
                //debugLog("End Width: " + this.line);
                break;
            case 43:
                // constant width - not use if 40 and/or 41 are set
                this.getDXFLine();
                //debugLog("Global Width: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 70:
                // flags Polyline flag (bit-coded); default is 0: 1 = Closed; 128 = Plinegen
                this.getDXFLine();
                flags = Number(this.line);
                //debugLog("flags: " + this.line);
                break;
            case 90:
                // number of vertices
                this.getDXFLine();
                vertices = Number(this.line);
                //debugLog("Number of Vertices: " + this.line);
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}


DXF.prototype.readSpline = function () {

    var points = new Array();
    var x_ctrl_points = new Array();
    var y_ctrl_points = new Array();
    var x_fit_points = new Array();
    var y_fit_points = new Array();
    var knot_values = new Array();
    var vertices = 0; // store the number of points contained in the Spline
    var knots = 0;
    var control_points = 0;
    var fit_points = 0;
    var colour = "BYLAYER";
    var layer = "0"
    var flags;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)

        switch (n) {
            case 0:
                // next item found, so finish with Spline

                //debugLog("Knots: " + knots);
                //debugLog("Control Points: " + control_points);
                //debugLog("Vertices: " + vertices);
                //debugLog("Control Points array length: " + x_ctrl_points.length);
                //debugLog("Fit points array length: " + x_fit_points.length);

                if (control_points > 0 && x_ctrl_points.length === y_ctrl_points.length) {

                    for (var i = 0; i < control_points; i++) {

                        var point = new Point();
                        point.x = x_ctrl_points[i];
                        point.y = y_ctrl_points[i];

                        points.push(point);

                    }

                    if (flags === 1) {
                        // Flag 1 signifies a closed shape. Copy the first point to the last index.
                        points.push(points[0]);
                    }

                    var spline = {
                        points: points,
                        colour: colour,
                        layer: layer
                    }

                    addToScene("Spline", spline)
                    //alsoAddToScene("Spline", points, colour);
                }

                return true;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("Layer: " + this.line);
                layer = this.line;
                break;
            case 10:
                // control x
                this.getDXFLine();
                x_ctrl_points.push(Number(this.line));
                //debugLog("Control X: " + this.line);
                break;
            case 20:
                // control y
                this.getDXFLine();
                y_ctrl_points.push(Number(this.line));
                //debugLog("Control Y: " + this.line);
                break;
            case 30:
                // control z
                this.getDXFLine();
                //debugLog("Control Z: " + this.line);
                break;
            case 11:
                // fit x
                this.getDXFLine();
                x_fit_points = Number(this.line);
                //debugLog("Fit X: " + this.line);
                break;
            case 21:
                // fit y
                this.getDXFLine();
                y_fit_points = Number(this.line);
                //debugLog("Fit Y: " + this.line);
                break;
            case 31:
                // fit z
                this.getDXFLine();
                //debugLog("Fit Z: " + this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 210:
                // normal x
                this.getDXFLine();
                //debugLog("Normal X: " + this.line);
                break;
            case 220:
                // normal y
                this.getDXFLine();
                //debugLog("Normal Y: " + this.line);
                break;
            case 230:
                // normal z
                this.getDXFLine();
                //debugLog("Normal Z: " + this.line);
                break;
            case 70:
                // flags
                this.getDXFLine();
                flags = Number(this.line);
                //debugLog("flags: " + this.line);
                break;
            case 71:
                // degree
                this.getDXFLine();
                //debugLog("Degree: " + this.line);
                break;
            case 72:
                // knots
                this.getDXFLine();
                knots = Number(this.line);
                //debugLog("Knots: " + this.line);
                break;
            case 73:
                // control points
                this.getDXFLine();
                control_points = Number(this.line);
                //debugLog("Control Points: " + this.line);
                break;
            case 74:
                // fit points
                this.getDXFLine();
                fit_points = Number(this.line);
                //debugLog("Fit Points: " + this.line);
                break;
            case 12:
                // starttan x
                this.getDXFLine();
                //debugLog("StartTan X: " + this.line);
                break;
            case 22:
                // starttan y
                this.getDXFLine();
                //debugLog("StartTan Y: " + this.line);
                break;
            case 32:
                // starttan z
                this.getDXFLine();
                //debugLog("StartTan Z: " + this.line);
                break;
            case 13:
                // endtan x
                this.getDXFLine();
                //debugLog("EndTan X: " + this.line);
                break;
            case 23:
                // endtan y
                this.getDXFLine();
                //debugLog("EndTan Y: " + this.line);
                break;
            case 33:
                // endtan z
                this.getDXFLine();
                //debugLog("EndTan Z: " + this.line);
                break;
            case 40:
                // knot value
                this.getDXFLine();
                knot_values.push(Number(this.line));
                //debugLog("Knot Value: " + this.line);
                break;
            case 41:
                // weight
                this.getDXFLine();
                //debugLog("Weight: " + this.line);
                break;
            case 42:
                this.getDXFLine();
                //debugLog("DXF Readline 42");
                break;
            case 43:
                this.getDXFLine();
                //debugLog("DXF Readline 43");
                break;
            case 44:
                // skip the next line
                this.getDXFLine();
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}


DXF.prototype.readText = function () {

    var points = new Array();

    var firstAlignmentPoint = new Point();
    var secondAlignmentPoint = new Point();

    var string = "";
    var height = 2.5;
    var rotation = 0;
    var horizontalAlignment = 0;
    var verticalAlignment = 0;

    var colour = "BYLAYER";
    var layer = "0"
    var flags;

    while (this.lineNum < this.lines.length) {

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)
        //console.log("Group Code: " + n)

        switch (n) {
            case 0:

                points.push(firstAlignmentPoint)

                if (secondAlignmentPoint.x && secondAlignmentPoint.y) {
                    points.push(secondAlignmentPoint)
                }

                var text = {
                    points: points,
                    colour: colour,
                    layer: layer,

                    string: string,
                    height: height,
                    rotation: rotation,
                    horizontalAlignment: horizontalAlignment,
                    verticalAlignment: verticalAlignment,
                    flags: flags,
                }

                addToScene("Text", text)

                return true;
            case 1: // Text string follows
                this.getDXFLine();
                //console.log("text: ", this.line)
                //debugLog("String: " + this.line);
                string = this.line;
                break;
            case 8: // Layer name follows
                this.getDXFLine();
                //debugLog("Layer: " + this.line);
                layer = this.line;
                break;
            case 10:
                // x
                this.getDXFLine();
                firstAlignmentPoint.x = this.line;
                //debugLog("Text X: " + this.line);
                break;
            case 20:
                // y
                this.getDXFLine();
                firstAlignmentPoint.y = this.line;
                //debugLog("Text Y: " + this.line);
                break;
            case 30:
                // z
                this.getDXFLine();
                //debugLog("Text Z: " + this.line);
                break;
            case 11:
                // x
                this.getDXFLine();
                secondAlignmentPoint.x = this.line;
                //debugLog("Text X: " + this.line);
                break;
            case 21:
                // y
                this.getDXFLine();
                secondAlignmentPoint.y = this.line;
                //debugLog("Text Y: " + this.line);
                break;
            case 31:
                // z
                this.getDXFLine();
                //debugLog("Text Z: " + this.line);
                break;
            case 40:
                // height
                this.getDXFLine();
                //debugLog("Text Height: " + this.line);
                //console.log("Text Height: " + this.line);
                height = Number(this.line);
                break;
            case 50:
                // rotation
                this.getDXFLine();
                //debugLog("Text rotation: " + this.line);
                //console.log("Text rotation: " + this.line)
                rotation = Number(this.line);
                break;
            case 62:
                // color index
                this.getDXFLine();
                //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
                colour = getHexColour(Number(this.line));
                break;
            case 71:
                //Text generation flags (optional, default = 0):
                //2 = Text is backward (mirrored in X).
                //4 = Text is upside down (mirrored in Y).
                this.getDXFLine();
                //debugLog("Text Flags: " + this.line);
                //console.log("Text Flags: " + this.line);
                flags = Number(this.line);
                break;
            case 72:
                // Horizontal text justification type (optional, default = 0) integer codes (not bit-coded)
                // 0 = Left; 1= Center; 2 = Right
                // 3 = Aligned (if vertical alignment = 0)
                // 4 = Middle (if vertical alignment = 0)
                // 5 = Fit (if vertical alignment = 0)
                this.getDXFLine();
                //debugLog("Horizontal Alignment: " + this.line);
                //console.log("Horizontal Alignment: " + this.line);
                horizontalAlignment = Number(this.line);
                break;
            case 73:
                //Vertical text justification type (optional, default = 0): integer codes (not bit- coded):
                //0 = Baseline; 1 = Bottom; 2 = Middle; 3 = Top
                //See the Group 72 and 73 integer codes table for clarification.
                this.getDXFLine();
                //debugLog("Vertical Alignment: " + this.line);
                //console.log("Vertical Alignment: " + this.line);
                verticalAlignment = Number(this.line);
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}

/*
DXF.prototype.readText = function(){

    var colour = "BYLAYER";
    var layer = "0"

    while( this.lineNum < this.lines.length){

        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)

        switch(n){
        case 0:
            // next item found, so finish with text
            return;
        case 5: // handle name follows
            this.getDXFLine();;
            //debugLog("Handle name: " + this.line);
            break;
        case 6: // line style name follows
            this.getDXFLine();;
            //debugLog(this.line);
            break;
        case 8: // Layer name follows
            this.getDXFLine();
            //debugLog("layer: " + this.line);
            layer = this.line;
            break;
        case 10:
            // centre x
            this.getDXFLine();
            //debugLog("centre x: " + this.line);
            break;
        case 20:
            // centre y
            this.getDXFLine();
            //debugLog("centre y: " + this.line);
            break;
        case 30:
            // centre z
            this.getDXFLine();
            //debugLog("centre z: " + this.line);
            break;
        case 40:
            // text height
            this.getDXFLine();
            //debugLog("text height: " + this.line);
            break;
        case 1:
            // text
            this.getDXFLine();
            //debugLog("text string: " + this.line);
            return(true);

        case 62:
            // color index
            this.getDXFLine();
            //debugLog("Colour: ACAD:" + this.line + " HEX: " + getHexColour(Number(this.line)));
            colour = getHexColour(Number(this.line));
            break;

        case 100:
            this.getDXFLine();
            //debugLog("DXF Readline 100");
            break;
        case 39:
            this.getDXFLine();
            //debugLog("DXF Readline 39");
            break;
        case 210:
            this.getDXFLine();
            //debugLog("DXF Readline 210");
            break;
        case 220:
            this.getDXFLine();
            //debugLog("DXF Readline 220");
            break;
        case 230:
            // skip the next line
            this.getDXFLine();
            break;
        default:
            // skip the next line
            this.getDXFLine();
            break;
        }
    }
}*/


DXF.prototype.readVPort = function () {

    var centre = new Point();
    var width = 0;
    var height = 0;
    var ratio = 0;

    while (this.lineNum < this.lines.length) {
        this.getDXFLine();
        var n = parseInt(this.line);
        //debugLog("Group Code: " + n)
        //console.log("Group Code: " + n)

        switch (n) {
            case 0:

                if (height !== 0 && ratio !== 0) {
                    width = height * ratio
                    //console.log("Vport Width: ", width)
                }

                /*   var vport = {
                       centre: centre,
                       height: height,
                       width: width
                   }*/
                //console.log("TODO: Implement Centring the data")
                //centreVPORT(centre, width, height);

                return true;
            case 2:
                // name
                this.getDXFLine();
                //console.log("VPORT Name: " + this.line);
                break;
            case 10:
                // x
                this.getDXFLine();
                //console.log("Bottom Left X: " + this.line);          
                break;
            case 20:
                // y
                this.getDXFLine();
                //console.log("Bottom Left Y: " + this.line);
                break;
            case 11:
                // x
                this.getDXFLine();
                //console.log("Top Right X: " + this.line);
                break;
            case 21:
                // y
                this.getDXFLine();
                //console.log("Top Right Y: " + this.line);
                break;
            case 12:
                // x
                this.getDXFLine();
                //console.log("Centre X: " + this.line);
                centre.x = Number(this.line);
                break;
            case 22:
                // y
                this.getDXFLine();
                //console.log("Centre Y: " + this.line);
                centre.y = Number(this.line);
                break;
            case 40:
                // View Height
                this.getDXFLine();
                //console.log("Viewport Height: " + this.line);
                height = Number(this.line);
                break;
            case 41:
                // Viewport ratio
                this.getDXFLine();
                //console.log("Viewport ratio: " + this.line);
                ratio = this.line;
                break;
            case 70:
                // flags
                this.getDXFLine();
                //console.log("Viewport Flags: " + this.line);
                break;
            case 76:
                // grid on/off
                this.getDXFLine();
                //console.log("Grid ON/OFF: " + this.line);
                break;
            default:
                // skip the next line
                this.getDXFLine();
                break;
        }
    }
}
