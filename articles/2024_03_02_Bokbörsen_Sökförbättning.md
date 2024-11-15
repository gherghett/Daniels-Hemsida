## Bokbörsen Sökförbättring

Mitt favoritsätt att köpa böcker är på bokbörsen.

Där kan vem som helst sälja sina böcker, men många antikvariat har också sina samlingar där, och kan sälja många böcker till mycket låga priser. Att hitta 10 böcker för 15 kronor styck, totalt 150 kr, är inte ovanligt. Problemet är dock att för varje säljare du köper från betalar du en fraktavgift på 50 kr. Så om du köper 10 böcker à 15 kr från 10 olika säljare, kommer du inte att betala 150 kr totalt, utan 50 kr * 10 + 15 kr * 10, dvs. 650 kr. Det är 300 % mer.

Därför föredrar man ofta att köpa alla böcker från samma säljare. För att underlätta detta har jag skapat ett Python-skript. Det fungerar genom att göra sökningar efter de böcker man vill ha och skapar sedan listor över de säljare som har dessa böcker. Sedan jämförs dessa listor för att hitta säljare som har alla, eller flest av, de böcker man söker. På så sätt kan man spara hundratals kronor på fraktkostnader. En funktionalitet som, enligt min mening, Bokbörsen borde erbjuda på sin hemsida från början.

Ta gärna en titt på skriptet här: [https://github.com/gherghett/bokborssearch](https://github.com/gherghett/bokborssearch)
Skriptet har vissa begränsningar, då det endast skrapar de första sidorna av sökresultaten, men det kan ändå ge snabba svar när man annars kan behöva spendera mycket tid på att jämföra säljare för att hitta någon med det utbud man söker.
