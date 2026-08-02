Option Explicit

Public Sub ExportTimetableJS()

    Dim ws As Worksheet
    Dim js As String
    Dim filePath As String

    Set ws = ThisWorkbook.Worksheets("2026")
    filePath = ThisWorkbook.Path & "\timetable.js"

    js = ""
    js = js & "const timetable = {" & vbCrLf
    js = js & "    nobori: {" & vbCrLf
    js = js & ExportNoboriTrains(ws)
    js = js & ExportNoboriRows(ws)
    js = js & "    }," & vbCrLf
    js = js & "    kudari: {" & vbCrLf
    js = js & ExportKudariTrains(ws)
    js = js & ExportKudariRows(ws)
    js = js & "    }" & vbCrLf
    js = js & "};" & vbCrLf

    Call SaveUtf8(js, filePath)

    MsgBox "timetable.js を作成しました。", vbInformation

End Sub
Private Function ExportNoboriTrains(ws As Worksheet) As String

    Dim col As Long
    Dim trainName As String
    Dim firstTrain As Boolean
    Dim lastCol As Long
    Dim s As String

    lastCol = ws.Cells(7, ws.Columns.Count).End(xlToLeft).Column

    s = "        trains: [" & vbCrLf
    firstTrain = True

    For col = 3 To lastCol

        If Trim(ws.Cells(7, col).Value) <> "" Then
            trainName = Trim(ws.Cells(7, col).Value)
        ElseIf Trim(ws.Cells(2, col).Value) <> "" Then
            trainName = Replace(ws.Cells(2, col).Value, vbLf, "")
        Else
            trainName = ""
        End If

        If trainName <> "" Then
            If Not firstTrain Then
                s = s & "," & vbCrLf
            End If
            s = s & "            """ & trainName & """"
            firstTrain = False
        End If

    Next col

    s = s & vbCrLf & "        ]," & vbCrLf

    ExportNoboriTrains = s

End Function
Private Function ExportNoboriRows(ws As Worksheet) As String

    Dim r As Long
    Dim c As Long
    Dim station As String
    Dim firstRow As Boolean
    Dim lastCol As Long
    Dim timeText As String
    Dim s As String

    lastCol = ws.Cells(7, ws.Columns.Count).End(xlToLeft).Column

    s = "        rows: [" & vbCrLf
    firstRow = True

    For r = 8 To 31

        station = Trim(ws.Cells(r, 1).Value)
        If station = "" Then GoTo NextRow

        If Trim(ws.Cells(r, 2).Value) <> "" Then
            station = station & " " & Trim(ws.Cells(r, 2).Value)
        End If

        If Not firstRow Then
            s = s & "," & vbCrLf
        End If

        s = s & "            {" & vbCrLf
        s = s & "                station: """ & station & """," & vbCrLf
        s = s & "                times: [" 

        For c = 3 To lastCol
            timeText = Trim(ws.Cells(r, c).Text)
            s = s & """" & timeText & """"
            If c < lastCol Then
                s = s & ","
            End If
        Next c

        s = s & "]" & vbCrLf
        s = s & "            }"

        firstRow = False

NextRow:
    Next r

    s = s & vbCrLf & "        ]," & vbCrLf

    ExportNoboriRows = s

End Function
Private Function ExportKudariTrains(ws As Worksheet) As String

    Dim col As Long
    Dim trainName As String
    Dim firstTrain As Boolean
    Dim lastCol As Long
    Dim s As String

    lastCol = ws.Cells(43, ws.Columns.Count).End(xlToLeft).Column

    s = "        trains: [" & vbCrLf
    firstTrain = True

    For col = 3 To lastCol

        If Trim(ws.Cells(43, col).Text) <> "" Then
            trainName = Trim(ws.Cells(43, col).Text)
        ElseIf Trim(ws.Cells(34, col).Text) <> "" Then
            trainName = Replace(ws.Cells(34, col).Text, vbLf, "")
        Else
            trainName = ""
        End If

        If trainName <> "" Then
            If Not firstTrain Then
                s = s & "," & vbCrLf
            End If
            s = s & "            """ & trainName & """"
            firstTrain = False
        End If

    Next col

    s = s & vbCrLf & "        ]," & vbCrLf

    ExportKudariTrains = s

End Function
Private Function ExportKudariRows(ws As Worksheet) As String

    Dim r As Long
    Dim c As Long
    Dim station As String
    Dim firstRow As Boolean
    Dim lastCol As Long
    Dim timeText As String
    Dim s As String

    lastCol = ws.Cells(43, ws.Columns.Count).End(xlToLeft).Column

    s = "        rows: [" & vbCrLf
    firstRow = True

    For r = 44 To 64
        station = Trim(ws.Cells(r, 1).Value)
        If station = "" Then GoTo NextRow

        If Trim(ws.Cells(r, 2).Value) <> "" Then
            station = station & " " & Trim(ws.Cells(r, 2).Value)
        End If

        If Not firstRow Then
            s = s & "," & vbCrLf
        End If

        s = s & "            {" & vbCrLf
        s = s & "                station: """ & station & """," & vbCrLf
        s = s & "                times: [" 

        For c = 3 To lastCol
            timeText = Trim(ws.Cells(r, c).Text)
            s = s & """" & timeText & """"
            If c < lastCol Then
                s = s & ","
            End If
        Next c

        s = s & "]" & vbCrLf
        s = s & "            }"

        firstRow = False

NextRow:
    Next r

    s = s & vbCrLf & "        ]" & vbCrLf

    ExportKudariRows = s

End Function
Private Sub SaveUtf8(text As String, filePath As String)

    Dim stm As Object
    Dim bin As Object

    Set stm = CreateObject("ADODB.Stream")
    stm.Type = 2
    stm.Charset = "UTF-8"
    stm.Open
    stm.WriteText text

    stm.Position = 0
    stm.Type = 1
    stm.Position = 3   ' UTF-8 BOM除去

    Set bin = CreateObject("ADODB.Stream")
    bin.Type = 1
    bin.Open

    stm.CopyTo bin
    bin.SaveToFile filePath, 2

    bin.Close
    stm.Close

End Sub
