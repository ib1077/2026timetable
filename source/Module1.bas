Option Explicit

'========================================================
' 親切くん
'
' Excelで選択した範囲を、そのまま timetable.js にする
'
' 上り：
'   A2から始まる範囲
'   列車名行は範囲の6行目
'
' 下り：
'   A34から始まる範囲
'   列車名行は範囲の10行目
'
' 空欄も列位置も、そのまま保持する
'========================================================


Public Sub ExportTimetableJS()

    Dim noboriRange As Range
    Dim kudariRange As Range

    Dim js As String
    Dim filePath As String


    '====================================================
    ' 上り範囲を選択
    '====================================================

    MsgBox _
        "【上りデータ範囲】" & vbCrLf & vbCrLf & _
        "Excelに戻ったら、上りのデータ範囲を" & vbCrLf & _
        "マウスでドラッグして選択してください。" & vbCrLf & vbCrLf & _
        "例：A2:AK31" & vbCrLf & vbCrLf & _
        "※空欄もそのままデータになります。" & vbCrLf & _
        "※列を詰めたり削除したりしません。", _
        vbInformation, _
        "親切くん"


    On Error Resume Next

    Set noboriRange = Application.InputBox( _
        Prompt:="上りのデータ範囲を選択してください。", _
        Title:="親切くん：上り範囲", _
        Type:=8)

    On Error GoTo 0


    If noboriRange Is Nothing Then

        MsgBox _
            "上りの範囲が選択されていません。" & vbCrLf & _
            "処理を中止しました。", _
            vbInformation

        Exit Sub

    End If


    '====================================================
    ' 上り範囲チェック
    '====================================================

    If noboriRange.Areas.Count <> 1 Then

        MsgBox _
            "複数の範囲は選択できません。" & vbCrLf & vbCrLf & _
            "1つの四角い範囲を選択してください。", _
            vbExclamation

        Exit Sub

    End If


    If noboriRange.Row <> 2 Or noboriRange.Column <> 1 Then

        MsgBox _
            "上りの範囲は A2 から始めてください。" & vbCrLf & vbCrLf & _
            "例：A2:AK31", _
            vbExclamation

        Exit Sub

    End If


    '====================================================
    ' 下り範囲を選択
    '====================================================

    MsgBox _
        "【下りデータ範囲】" & vbCrLf & vbCrLf & _
        "Excelに戻ったら、下りのデータ範囲を" & vbCrLf & _
        "マウスでドラッグして選択してください。" & vbCrLf & vbCrLf & _
        "例：A34:AK64" & vbCrLf & vbCrLf & _
        "※空欄もそのままデータになります。" & vbCrLf & _
        "※列を詰めたり削除したりしません。", _
        vbInformation, _
        "親切くん"


    On Error Resume Next

    Set kudariRange = Application.InputBox( _
        Prompt:="下りのデータ範囲を選択してください。", _
        Title:="親切くん：下り範囲", _
        Type:=8)

    On Error GoTo 0


    If kudariRange Is Nothing Then

        MsgBox _
            "下りの範囲が選択されていません。" & vbCrLf & _
            "処理を中止しました。", _
            vbInformation

        Exit Sub

    End If


    '====================================================
    ' 下り範囲チェック
    '====================================================

    If kudariRange.Areas.Count <> 1 Then

        MsgBox _
            "複数の範囲は選択できません。" & vbCrLf & vbCrLf & _
            "1つの四角い範囲を選択してください。", _
            vbExclamation

        Exit Sub

    End If


    If kudariRange.Row <> 34 Or kudariRange.Column <> 1 Then

        MsgBox _
            "下りの範囲は A34 から始めてください。" & vbCrLf & vbCrLf & _
            "例：A34:AK64", _
            vbExclamation

        Exit Sub

    End If


    '====================================================
    ' 最終確認
    '====================================================

    If MsgBox( _
        "【選択範囲の確認】" & vbCrLf & vbCrLf & _
        "上り：" & noboriRange.Address(False, False) & vbCrLf & _
        "下り：" & kudariRange.Address(False, False) & vbCrLf & vbCrLf & _
        "この範囲で timetable.js を作成しますか？", _
        vbYesNo + vbQuestion, _
        "親切くん：最終確認") <> vbYes Then

        MsgBox "処理を中止しました。", vbInformation

        Exit Sub

    End If


    '====================================================
    ' timetable.js 作成
    '====================================================

    js = ""

    js = js & "const timetable = {" & vbCrLf


    '----------------------------------------------------
    ' のぼり
    '----------------------------------------------------

    js = js & "    nobori: {" & vbCrLf

    js = js & ExportTrains( _
                    noboriRange, _
                    noboriRange.Row + 5, _
                    noboriRange.Row)

    js = js & ExportRows( _
                    noboriRange, _
                    noboriRange.Row + 5)

    js = js & "    }," & vbCrLf


    '----------------------------------------------------
    ' くだり
    '----------------------------------------------------

    js = js & "    kudari: {" & vbCrLf

    js = js & ExportTrains( _
                    kudariRange, _
                    kudariRange.Row + 9, _
                    kudariRange.Row)

    js = js & ExportRows( _
                    kudariRange, _
                    kudariRange.Row + 9)

    js = js & "    }" & vbCrLf


    js = js & "};" & vbCrLf


    '====================================================
    ' 保存
    '====================================================

    If ThisWorkbook.Path = "" Then

        MsgBox _
            "このExcelファイルがまだ保存されていません。" & vbCrLf & vbCrLf & _
            "先にExcelファイルを保存してください。", _
            vbExclamation

        Exit Sub

    End If


    filePath = ThisWorkbook.Path & "\timetable.js"


    Call SaveUtf8(js, filePath)


    '====================================================
    ' 完了
    '====================================================

    MsgBox _
        "timetable.js を作成しました。" & vbCrLf & vbCrLf & _
        "上り：" & noboriRange.Address(False, False) & vbCrLf & _
        "下り：" & kudariRange.Address(False, False), _
        vbInformation, _
        "親切くん：完了"


End Sub



'========================================================
' 列車名
'
' 例：
'
' 720D
' 722D
' 724D
' スーパーはくと2号
' 726D
' ...
'
' 空欄も残す
'========================================================

Private Function ExportTrains( _
    dataRange As Range, _
    trainRow As Long, _
    fallbackRow As Long) As String


    Dim firstCol As Long
    Dim lastCol As Long
    Dim col As Long

    Dim trainName As String

    Dim s As String
    Dim firstTrain As Boolean


    firstCol = dataRange.Column + 2

    lastCol = _
        dataRange.Column + _
        dataRange.Columns.Count - 1


    s = "        trains: [" & vbCrLf

    firstTrain = True


    For col = firstCol To lastCol


        '----------------------------------------------
        ' 列車名行を見る
        '----------------------------------------------

        trainName = Trim( _
            GetCellText( _
                dataRange.Worksheet, _
                trainRow, _
                col))


        '----------------------------------------------
        ' 列車名行が空なら、
        ' 範囲の最初の行を見る
        '----------------------------------------------

        If trainName = "" Then

            trainName = Replace( _
                GetCellText( _
                    dataRange.Worksheet, _
                    fallbackRow, _
                    col), _
                vbLf, "")

            trainName = Trim(trainName)

        End If


        '----------------------------------------------
        ' カンマ
        '----------------------------------------------

        If Not firstTrain Then

            s = s & "," & vbCrLf

        End If


        '----------------------------------------------
        ' 列車名
        '
        ' 空欄なら ""
        '----------------------------------------------

        s = s & _
            "            """ & _
            JsEscape(trainName) & _
            """"


        firstTrain = False


    Next col


    s = s & vbCrLf & _
        "        ]," & vbCrLf


    ExportTrains = s


End Function



'========================================================
' 駅ごとの時刻
'
' C列以降を、そのまま配列にする
'
' 空欄：
'   ""
'
' ⋯：
'   "⋯"
'
' ↓734D：
'   "↓734D"
'
' すべて意味を考えず、そのまま運ぶ
'========================================================

Private Function ExportRows( _
    dataRange As Range, _
    trainRow As Long) As String


    Dim r As Long
    Dim c As Long

    Dim firstCol As Long
    Dim lastCol As Long

    Dim firstRow As Long
    Dim lastRow As Long

    Dim station As String
    Dim timeText As String

    Dim s As String
    Dim firstOutputRow As Boolean


    firstRow = dataRange.Row

    lastRow = _
        dataRange.Row + _
        dataRange.Rows.Count - 1


    firstCol = dataRange.Column + 2

    lastCol = _
        dataRange.Column + _
        dataRange.Columns.Count - 1


    s = "        rows: [" & vbCrLf

    firstOutputRow = True


    For r = firstRow To lastRow


        '----------------------------------------------
        ' 列車名の行は rows には入れない
        '----------------------------------------------

        If r = trainRow Then

            GoTo NextRow

        End If


        '----------------------------------------------
        ' 駅名
        '----------------------------------------------

        station = Trim( _
            GetCellText( _
                dataRange.Worksheet, _
                r, _
                1))


        '駅名が完全に空の行は表示データにしない

        If station = "" Then

            GoTo NextRow

        End If


        '----------------------------------------------
        ' 着・発
        '----------------------------------------------

        If Trim( _
            GetCellText( _
                dataRange.Worksheet, _
                r, _
                2)) <> "" Then

            station = _
                station & " " & _
                Trim( _
                    GetCellText( _
                        dataRange.Worksheet, _
                        r, _
                        2))

        End If


        '----------------------------------------------
        ' カンマ
        '----------------------------------------------

        If Not firstOutputRow Then

            s = s & "," & vbCrLf

        End If


        '----------------------------------------------
        ' 駅
        '----------------------------------------------

        s = s & "            {" & vbCrLf

        s = s & _
            "                station: """ & _
            JsEscape(station) & _
            """," & vbCrLf


        '----------------------------------------------
        ' 時刻
        '----------------------------------------------

        s = s & _
            "                times: ["


        For c = firstCol To lastCol


            timeText = Trim( _
                GetCellText( _
                    dataRange.Worksheet, _
                    r, _
                    c))


            s = s & _
                """" & _
                JsEscape(timeText) & _
                """"


            If c < lastCol Then

                s = s & ","

            End If


        Next c


        s = s & "]" & vbCrLf

        s = s & "            }"


        firstOutputRow = False


NextRow:

    Next r


    s = s & vbCrLf & _
        "        ]" & vbCrLf


    ExportRows = s


End Function



'========================================================
' セルの中身を取得
'
' ★重要★
'
' シート名は見ない。
' マウスで選択した範囲が存在するシートを使う。
'========================================================

Private Function GetCellText( _
    ByVal ws As Worksheet, _
    ByVal rowNum As Long, _
    ByVal colNum As Long) As String


    GetCellText = ws.Cells(rowNum, colNum).Text


End Function



'========================================================
' JavaScript用エスケープ
'========================================================

Private Function JsEscape( _
    ByVal text As String) As String


    text = Replace( _
        text, _
        "\", _
        "\\")


    text = Replace( _
        text, _
        """", _
        "\" & """")


    text = Replace( _
        text, _
        vbCr, _
        "")


    text = Replace( _
        text, _
        vbLf, _
        "")


    JsEscape = text


End Function



'========================================================
' UTF-8で保存
'========================================================

Private Sub SaveUtf8( _
    text As String, _
    filePath As String)


    Dim stm As Object
    Dim bin As Object


    Set stm = CreateObject("ADODB.Stream")


    stm.Type = 2

    stm.Charset = "UTF-8"

    stm.Open


    stm.WriteText text


    stm.Position = 0

    stm.Type = 1

    stm.Position = 3


    Set bin = CreateObject("ADODB.Stream")


    bin.Type = 1

    bin.Open


    stm.CopyTo bin


    bin.SaveToFile filePath, 2


    bin.Close

    stm.Close


End Sub