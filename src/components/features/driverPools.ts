import type { Locale } from "@/lib/i18n/config";

// Per-locale driver identities (name + license plate) for the feature-showcase
// mockups. Names + plates match the page language: RO → Romanian, EN → a
// pan-European mix, DE → German, etc. Generated via the v4-research workflow
// (Polish set hand-completed). Freight companies are international brands and
// stay global (see COMPANIES in DockBoardPlayer).
export type Driver = { name: string; plate: string };

export const DRIVER_POOLS: Record<Locale, Driver[]> = {
  ro: [
    { name: "Andrei Popescu", plate: "B 218 QRG" }, { name: "Mihai Ionescu", plate: "CJ 07 LGX" },
    { name: "Gheorghe Dumitru", plate: "TM 44 DEL" }, { name: "Vasile Constantin", plate: "IS 92 TRK" },
    { name: "Cristian Stan", plate: "CT 156 VAN" }, { name: "Ionuț Radu", plate: "BV 33 POP" },
    { name: "Marius Gheorghiu", plate: "SB 78 MNC" }, { name: "Florin Marin", plate: "MM 12 ZLT" },
    { name: "Daniel Tudor", plate: "AG 204 HRB" }, { name: "Adrian Barbu", plate: "PH 61 CDX" },
    { name: "Nicolae Nistor", plate: "GL 189 FTR" }, { name: "Bogdan Ciobanu", plate: "BC 27 WLK" },
    { name: "Ștefan Oprea", plate: "DJ 143 KMS" }, { name: "Răzvan Lupu", plate: "AR 55 NGD" },
  ],
  en: [
    { name: "Oliver Bennett", plate: "B 218 QRG" }, { name: "Lukas Wagner", plate: "M-AB 1234" },
    { name: "Mateusz Kowalski", plate: "WA 12345" }, { name: "Sander de Vries", plate: "12-ABC-3" },
    { name: "Julien Moreau", plate: "AB-123-CD" }, { name: "Marco Ricci", plate: "AB 123 CD" },
    { name: "Pablo Fernández", plate: "1234 ABC" }, { name: "Gábor Nagy", plate: "ABC-123" },
    { name: "Thomas Peeters", plate: "1-ABC-234" }, { name: "Andrei Popescu", plate: "CJ 07 LGX" },
    { name: "Felix Braun", plate: "K-HT 4820" }, { name: "Isabelle Laurent", plate: "CD-456-EF" },
    { name: "Katarzyna Nowak", plate: "KR 98765" }, { name: "Giulia Conti", plate: "GE 456 EF" },
  ],
  de: [
    { name: "Lukas Weber", plate: "M-AB 1234" }, { name: "Andreas Schneider", plate: "B-KL 872" },
    { name: "Sebastian Fischer", plate: "HH-RT 45" }, { name: "Thomas Wagner", plate: "K-XY 78" },
    { name: "Michael Becker", plate: "F-DG 3901" }, { name: "Stefan Hoffmann", plate: "S-MN 214" },
    { name: "Markus Schäfer", plate: "DD-PQ 66" }, { name: "Daniel Koch", plate: "HB-VW 1508" },
    { name: "Matthias Richter", plate: "DU-EF 927" }, { name: "Christian Bauer", plate: "M-TZ 34" },
    { name: "Florian Wolf", plate: "B-HN 4412" }, { name: "Jürgen Neumann", plate: "K-SD 190" },
    { name: "Alexander Braun", plate: "F-LM 285" }, { name: "Tobias Krüger", plate: "S-GR 7063" },
  ],
  pl: [
    { name: "Tomasz Wójcik", plate: "WA 8241K" }, { name: "Krzysztof Nowak", plate: "KR 12P45" },
    { name: "Andrzej Kowalski", plate: "PO 5AB67" }, { name: "Marcin Lewandowski", plate: "GD 78XY1" },
    { name: "Piotr Zieliński", plate: "WR 6789K" }, { name: "Paweł Wiśniewski", plate: "SZ 1KL23" },
    { name: "Michał Kamiński", plate: "LU 45MN6" }, { name: "Grzegorz Woźniak", plate: "RZ 789PQ" },
    { name: "Rafał Kozłowski", plate: "BI 12RS3" }, { name: "Jakub Jankowski", plate: "OL 4TU56" },
    { name: "Adam Mazur", plate: "KI 78VW9" }, { name: "Łukasz Krawczyk", plate: "EL 1XY23" },
    { name: "Marek Piotrowski", plate: "SK 456AB" }, { name: "Dariusz Grabowski", plate: "TA 7CD89" },
  ],
  hu: [
    { name: "Gábor Nagy", plate: "KLM-482" }, { name: "Zoltán Kovács", plate: "RT-KL-901" },
    { name: "István Szabó", plate: "BPH-317" }, { name: "Attila Tóth", plate: "FE-NY-206" },
    { name: "László Horváth", plate: "MHK-472" }, { name: "Péter Varga", plate: "SZ-GD-158" },
    { name: "Tamás Kiss", plate: "DKN-694" }, { name: "Ferenc Molnár", plate: "GY-RP-023" },
    { name: "Sándor Németh", plate: "PVR-539" }, { name: "József Farkas", plate: "NY-KZ-847" },
    { name: "Balázs Balogh", plate: "CST-260" }, { name: "András Papp", plate: "MI-LB-715" },
    { name: "Krisztián Takács", plate: "VZR-408" }, { name: "Márton Juhász", plate: "EG-TH-392" },
  ],
  bg: [
    { name: "Георги Иванов", plate: "CA 4821 KH" }, { name: "Димитър Петров", plate: "PB 7134 AB" },
    { name: "Николай Стоянов", plate: "BT 9256 BH" }, { name: "Иван Георгиев", plate: "PK 3078 EB" },
    { name: "Стефан Тодоров", plate: "BH 5643 KH" }, { name: "Петър Димитров", plate: "EB 2917 PB" },
    { name: "Христо Николов", plate: "KH 6482 CA" }, { name: "Мартин Ангелов", plate: "CA 1359 PK" },
    { name: "Владимир Костов", plate: "PB 8720 BT" }, { name: "Александър Колев", plate: "BT 4165 AB" },
    { name: "Красимир Василев", plate: "PK 9803 KH" }, { name: "Емил Маринов", plate: "BH 3524 EB" },
    { name: "Тодор Атанасов", plate: "EB 7091 CA" }, { name: "Борислав Йорданов", plate: "KH 5238 PB" },
  ],
  fr: [
    { name: "Julien Moreau", plate: "AB-724-CD" }, { name: "Camille Lefebvre", plate: "GT-482-QL" },
    { name: "Thomas Girard", plate: "DR-905-ZK" }, { name: "Antoine Rousseau", plate: "FH-317-MB" },
    { name: "Nicolas Fournier", plate: "KP-560-XR" }, { name: "Sébastien Bonnet", plate: "VN-238-JC" },
    { name: "Mathieu Dupont", plate: "RC-841-TG" }, { name: "Laurent Mercier", plate: "BM-193-WF" },
    { name: "Guillaume Faure", plate: "EL-627-PN" }, { name: "Pascal Garnier", plate: "HD-450-QV" },
    { name: "Vincent Chevalier", plate: "SZ-716-KD" }, { name: "Olivier Lambert", plate: "AC-382-RB" },
    { name: "Damien Robin", plate: "TF-509-GM" }, { name: "Frédéric Marchand", plate: "NW-864-LP" },
  ],
  nl: [
    { name: "Daan van Dijk", plate: "84-BXR-2" }, { name: "Sven Bakker", plate: "GH-451-P" },
    { name: "Lars de Vries", plate: "17-JND-5" }, { name: "Jeroen Jansen", plate: "XR-329-K" },
    { name: "Bram Visser", plate: "6-TKL-84" }, { name: "Thijs van den Berg", plate: "93-FDS-1" },
    { name: "Ruben Meijer", plate: "KP-207-B" }, { name: "Sander de Boer", plate: "2-HGV-46" },
    { name: "Wouter Mulder", plate: "58-ZLR-7" }, { name: "Niels Smit", plate: "VN-614-J" },
    { name: "Joost Kuipers", plate: "3-BRM-91" }, { name: "Marten Hendriks", plate: "77-CWP-4" },
    { name: "Ferdi van Leeuwen", plate: "DL-830-M" }, { name: "Koen Vermeulen", plate: "5-XFT-29" },
  ],
};
