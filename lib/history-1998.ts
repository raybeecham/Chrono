/**
 * Curated historical grounding for Chrono's December 4, 1998 Austin scenario.
 *
 * Grounding labels are deliberately narrow:
 * - documented: the core claim is directly supported by the linked source(s)
 * - representative: a period-informed synthesis, not a claim about one person
 * - fictional: an invented detail used only to make Sam's world feel inhabited
 */

export type GroundingKind = "documented" | "representative" | "fictional";

export type ConfidenceLevel = "high" | "medium";

export type CapsuleCategoryId =
  | "snapshot"
  | "technology"
  | "games"
  | "music"
  | "movies"
  | "prices"
  | "communication"
  | "daily-life";

export interface HistoricalSource {
  id: string;
  title: string;
  organization: string;
  dateLabel: string;
  url: string;
  summary: string;
}

export interface CapsuleFact {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  grounding: GroundingKind;
  confidence: ConfidenceLevel;
  sourceIds: string[];
}

export interface CapsuleCategory {
  id: CapsuleCategoryId;
  label: string;
  kicker: string;
  title: string;
  intro: string;
  facts: CapsuleFact[];
}

export const historicalSources: HistoricalSource[] = [
  {
    id: "nasa-sts-88",
    title: "STS-88",
    organization: "NASA",
    dateLabel: "Mission record: December 4–15, 1998",
    url: "https://www.nasa.gov/mission/sts-88/",
    summary:
      "NASA's mission record gives Endeavour's December 4 launch time and explains STS-88's role in beginning International Space Station assembly.",
  },
  {
    id: "austin-chronicle-1998-12-04",
    title: "December 4, 1998 issue",
    organization: "The Austin Chronicle",
    dateLabel: "December 4, 1998",
    url: "https://www.austinchronicle.com/issues/december-4-1998/",
    summary:
      "A contemporary Austin issue covering South Austin, live music, films, the AOL–Netscape deal, and the novelty and tradeoffs of shopping online.",
  },
  {
    id: "ntia-digital-divide-1998",
    title: "Falling Through the Net: Defining the Digital Divide",
    organization: "NTIA and U.S. Census Bureau",
    dateLabel: "July 1999; based on December 1998 CPS data",
    url: "https://www.ntia.doc.gov/ntiahome/fttn99/fttn.pdf",
    summary:
      "The federal report estimates that 42.1% of U.S. households had a computer and 26.2% had Internet access in December 1998.",
  },
  {
    id: "pokemon-company-history",
    title: "History of Pokémon",
    organization: "The Pokémon Company",
    dateLabel: "Corporate history; 1998 entry",
    url: "https://corporate.pokemon.co.jp/en/aboutus/history/",
    summary:
      "The official timeline records the September 1998 U.S. launch of the Pokémon television series and Pokémon Red and Blue for Game Boy.",
  },
  {
    id: "strong-ocarina",
    title: "The Legend of Zelda: Ocarina of Time",
    organization: "The Strong National Museum of Play",
    dateLabel: "Published March 15, 2022; documents 1998 release",
    url: "https://www.museumofplay.org/games/the-legend-of-zelda-ocarina-of-time/",
    summary:
      "The museum documents the 1998 Nintendo 64 release, record U.S. preorders, rapid sales, and the game's influential 3D targeting system.",
  },
  {
    id: "billboard-1998-12-05",
    title: "Billboard, December 5, 1998",
    organization: "Billboard; scan preserved by World Radio History",
    dateLabel: "December 5, 1998 chart issue",
    url: "https://www.worldradiohistory.com/Archive-All-Music/Billboard/90s/1998/BB-1998-12-05.pdf",
    summary:
      "A scan of the contemporary issue containing the Hot 100 led by Celine Dion and R. Kelly's ‘I'm Your Angel.’",
  },
  {
    id: "numbers-box-office-1998-12-04",
    title: "Weekend Domestic Box Office: December 4, 1998",
    organization: "The Numbers",
    dateLabel: "December 4–6, 1998",
    url: "https://www.the-numbers.com/box-office-chart/weekend/1998/12/04",
    summary:
      "The archival weekend listing identifies Psycho opening alongside A Bug's Life, Enemy of the State, The Rugrats Movie, and The Waterboy.",
  },
  {
    id: "eia-gas-1998",
    title: "Weekly U.S. Regular Conventional Retail Gasoline Prices",
    organization: "U.S. Energy Information Administration",
    dateLabel: "Weekly series; November 30, 1998",
    url: "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=w&n=pet&s=emm_epmru_pte_nus_dpg",
    summary:
      "The national weekly series reports regular conventional gasoline at $0.954 per gallon on November 30, the latest observation before December 4.",
  },
  {
    id: "usps-letter-rates",
    title: "Rates for Domestic Letters Since 1863",
    organization: "Historian, United States Postal Service",
    dateLabel: "Historical rate table, updated February 2026",
    url: "https://about.usps.com/who/profile/history/pdf/domestic-letter-rates-since-1863.pdf",
    summary:
      "The USPS table shows a 32-cent first-ounce domestic letter rate from January 1, 1995 until January 10, 1999.",
  },
  {
    id: "dol-minimum-wage-history",
    title: "History of Federal Minimum Wage Rates",
    organization: "U.S. Department of Labor, Wage and Hour Division",
    dateLabel: "Historical table; 1997 rate entry",
    url: "https://www.dol.gov/agencies/whd/minimum-wage/history/chart",
    summary:
      "The official table shows a $5.15 federal minimum wage for covered, nonexempt workers beginning September 1, 1997.",
  },
];

export const capsuleCategories: CapsuleCategory[] = [
  {
    id: "snapshot",
    label: "Snapshot",
    kicker: "Friday, 12.04.98",
    title: "Austin wakes up while history lifts off",
    intro:
      "This is one specific Friday, not a generic collage of the nineties. National history and Austin's local week are unfolding at the same time.",
    facts: [
      {
        id: "snapshot-sts-88",
        eyebrow: "2:35 AM CST",
        title: "Endeavour leaves Earth",
        summary:
          "Space Shuttle Endeavour launches on STS-88 carrying Unity, the first U.S.-built International Space Station component.",
        detail:
          "NASA records the launch at 2:35 a.m. Central time on December 4. Over the following days, the crew will connect Unity with Russia's already-orbiting Zarya module and begin ISS assembly.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["nasa-sts-88"],
      },
      {
        id: "snapshot-austin-week",
        eyebrow: "On the newsstand",
        title: "South Austin meets cyberspace",
        summary:
          "The local weekly is covering the Broken Spoke and South Austin alongside online shopping and the AOL–Netscape deal.",
        detail:
          "The December 4 Chronicle is a useful time capsule precisely because old and new sit together: neighborhood identity, bookstores, dance halls, movie reviews, Web portals, and anxiety about buying things online.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["austin-chronicle-1998-12-04"],
      },
    ],
  },
  {
    id: "technology",
    label: "Technology",
    kicker: "The future is uneven",
    title: "A computer is exciting; a connection is not guaranteed",
    intro:
      "The Web is culturally loud in late 1998, but most U.S. homes are still offline. The family computer, when there is one, is usually shared.",
    facts: [
      {
        id: "technology-household-gap",
        eyebrow: "42.1% / 26.2%",
        title: "The desktop outruns the Internet",
        summary:
          "In December 1998, 42.1% of U.S. households had a computer, while only 26.2% had Internet access.",
        detail:
          "That gap matters to the scene: owning a PC does not automatically mean being online. The federal survey also found sharp differences by income, education, race, geography, and family structure.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["ntia-digital-divide-1998"],
      },
      {
        id: "technology-family-pc",
        eyebrow: "One machine, many users",
        title: "The computer has a place in the house",
        summary:
          "A plausible connected Austin household shares a beige tower, CRT monitor, speakers, printer, and one phone-line modem.",
        detail:
          "This is a representative setup, not a statistic about every home. The machine might sit in a den or bedroom, hold school files and CD-ROM games, and require family negotiation over whose turn it is.",
        grounding: "representative",
        confidence: "medium",
        sourceIds: ["ntia-digital-divide-1998"],
      },
    ],
  },
  {
    id: "games",
    label: "Games",
    kicker: "New worlds in a cartridge",
    title: "Hyrule is new, and Pokémania just landed",
    intro:
      "Two defining adventures are fresh enough to dominate school conversations, but each still lives on dedicated hardware with no downloadable patch waiting.",
    facts: [
      {
        id: "games-ocarina",
        eyebrow: "Nintendo 64",
        title: "Ocarina of Time is the new obsession",
        summary:
          "Released in 1998, Zelda's first 3D adventure arrives to record U.S. preorders and sells more than a million copies in under a week.",
        detail:
          "Its lock-on targeting helps solve a brand-new design problem: fighting in a freely moving 3D world. On December 4, it feels like a technical leap, not a retro classic.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["strong-ocarina"],
      },
      {
        id: "games-pokemon",
        eyebrow: "Game Boy",
        title: "Red and Blue have crossed the Pacific",
        summary:
          "Pokémon Red and Blue and the first U.S. television series launched in September 1998.",
        detail:
          "By this Friday, choosing a cartridge, comparing teams, and finding someone to trade with can plausibly be the newest shared language at school. That social texture is representative; the U.S. launch is documented.",
        grounding: "representative",
        confidence: "medium",
        sourceIds: ["pokemon-company-history"],
      },
      {
        id: "games-sam-save",
        eyebrow: "Sam's save file",
        title: "The Water Temple can wait",
        summary:
          "Sam claims he is ‘almost done’ with Ocarina of Time, which mostly means he refuses to admit he is stuck.",
        detail:
          "This is fictional characterization for Chrono's Sam, not a historical claim. The game and its late-1998 prominence are real; this particular save file is not.",
        grounding: "fictional",
        confidence: "medium",
        sourceIds: [],
      },
    ],
  },
  {
    id: "music",
    label: "Music",
    kicker: "Radio, CDs, and live rooms",
    title: "The national chart and the Austin stage overlap",
    intro:
      "Music discovery moves through radio rotation, MTV, friends, record stores, and venue calendars. A favorite song is something you wait to hear or choose to buy.",
    facts: [
      {
        id: "music-hot-100",
        eyebrow: "Hot 100",
        title: "‘I'm Your Angel’ reaches number one",
        summary:
          "The Billboard Hot 100 dated December 5, 1998 is led by Celine Dion and R. Kelly's ‘I'm Your Angel.’",
        detail:
          "The same issue marks a major chart-method change: airplay-only songs can now enter the Hot 100. The chart is a weekly snapshot, so its December 5 issue is the one arriving around this Friday.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["billboard-1998-12-05"],
      },
      {
        id: "music-broken-spoke",
        eyebrow: "South Austin",
        title: "The Broken Spoke is part of the living city",
        summary:
          "The December 4 Chronicle foregrounds country singer Don Walser and the Broken Spoke in its portrait of South Austin.",
        detail:
          "Austin's music identity is not just a later legend being projected backward. The contemporary issue treats musicians, clubs, and neighborhood culture as ordinary parts of that week's city.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["austin-chronicle-1998-12-04"],
      },
    ],
  },
  {
    id: "movies",
    label: "Movies",
    kicker: "What's playing",
    title: "Psycho opens into a crowded holiday marquee",
    intro:
      "A Friday movie means checking listings, choosing one theater and one showtime, and making a plan that will not update itself in your pocket.",
    facts: [
      {
        id: "movies-weekend-chart",
        eyebrow: "Opening Friday",
        title: "Psycho joins a crowded marquee",
        summary:
          "Psycho opens on December 4 alongside A Bug's Life, Enemy of the State, The Rugrats Movie, and The Waterboy.",
        detail:
          "The archival weekend chart identifies films playing nationally, but Chrono deliberately withholds the completed weekend rankings and grosses: nobody inside Friday, December 4 could know them yet.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["numbers-box-office-1998-12-04"],
      },
      {
        id: "movies-make-a-plan",
        eyebrow: "Before you leave",
        title: "Pick the showtime now",
        summary:
          "A plausible Austin movie plan starts with a newspaper listing or a phone call, then a fixed meeting time and place.",
        detail:
          "This is representative late-1998 behavior, not a universal rule. The practical difference is useful: once friends leave home, there is no group chat, live location, or app notification to rescue a vague plan.",
        grounding: "representative",
        confidence: "medium",
        sourceIds: ["austin-chronicle-1998-12-04"],
      },
    ],
  },
  {
    id: "prices",
    label: "Prices",
    kicker: "Pocket-money math",
    title: "A dollar goes farther, but paychecks are smaller too",
    intro:
      "Period prices need context. These are contemporary national benchmarks rather than invented Austin shelf tags, and they should not be compared with today without considering wages and inflation.",
    facts: [
      {
        id: "prices-gas",
        eyebrow: "About 95¢ a gallon",
        title: "Regular gas is below a dollar nationally",
        summary:
          "The latest U.S. weekly benchmark before December 4 puts regular conventional gasoline at $0.954 per gallon on November 30.",
        detail:
          "This supports ‘about 95 cents’ as national context, but it is not an exact quote from an Austin gas-station sign. Chrono does not use observations published after the selected Friday.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["eia-gas-1998"],
      },
      {
        id: "prices-stamp",
        eyebrow: "32¢",
        title: "Mail a one-ounce letter",
        summary:
          "The domestic first-ounce letter rate is 32 cents on December 4, 1998.",
        detail:
          "USPS records show the 32-cent rate beginning January 1, 1995 and the 33-cent rate taking effect January 10, 1999.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["usps-letter-rates"],
      },
      {
        id: "prices-minimum-wage",
        eyebrow: "$5.15 per hour",
        title: "The federal wage floor",
        summary:
          "The prevailing federal minimum wage in 1998 is $5.15 per hour.",
        detail:
          "The Department of Labor table says this rate took effect September 1, 1997 for covered, nonexempt workers. Coverage, exemptions, tips, and state rules mean it is a benchmark rather than Sam's fictional paycheck.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["dol-minimum-wage-history"],
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    kicker: "Reachable, not always online",
    title: "The house phone is infrastructure; Internet time is an event",
    intro:
      "Most U.S. households have telephone service, while only about a quarter have Internet access. Being offline is ordinary, not a failure state.",
    facts: [
      {
        id: "communication-phone-first",
        eyebrow: "94.1% vs. 26.2%",
        title: "Call the house, not the person",
        summary:
          "Federal estimates put telephone service in 94.1% of U.S. households and Internet access in 26.2% in 1998.",
        detail:
          "A friend may answer, but so might a parent or sibling. The numbers are national household estimates; they explain the period's communication baseline without claiming every Austin teenager lived the same way.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["ntia-digital-divide-1998"],
      },
      {
        id: "communication-dial-up",
        eyebrow: "The modem handshake",
        title: "Going online occupies the line",
        summary:
          "A representative home setup dials an Internet provider over the same copper line used for voice calls.",
        detail:
          "Someone trying to call can get a busy signal, and another person picking up an extension can disrupt the connection. House rules about Internet time are therefore believable, but not universal.",
        grounding: "representative",
        confidence: "medium",
        sourceIds: ["ntia-digital-divide-1998"],
      },
      {
        id: "communication-sam-screen-name",
        eyebrow: "Buddy list",
        title: "Sam signs on as LoneStarKid17",
        summary:
          "Sam's screen name and tiny buddy list give Chrono's chat world a personal edge.",
        detail:
          "The character and handle are fictional reconstruction. They should never be presented as evidence about a real Austin teenager or a documented account.",
        grounding: "fictional",
        confidence: "medium",
        sourceIds: [],
      },
    ],
  },
  {
    id: "daily-life",
    label: "Daily Life",
    kicker: "Friction makes the rhythm",
    title: "Plans, media, and errands leave physical traces",
    intro:
      "The period is not defined only by missing future gadgets. It has its own useful objects and habits: printed listings, shared machines, cash, landlines, tapes, discs, and agreed meeting spots.",
    facts: [
      {
        id: "daily-life-local-weekly",
        eyebrow: "One thick weekly",
        title: "The city arrives on paper",
        summary:
          "The December 4 Chronicle bundles local politics, bookstores, music, film, theater, neighborhood stories, and Web culture into one issue.",
        detail:
          "That mix makes a local weekly a practical interface to the city: something to browse for an event, circle, fold, carry, or leave beside the phone.",
        grounding: "documented",
        confidence: "high",
        sourceIds: ["austin-chronicle-1998-12-04"],
      },
      {
        id: "daily-life-meet-me-there",
        eyebrow: "Plans need coordinates",
        title: "‘Seven-thirty by the ticket window’",
        summary:
          "A representative plan specifies a time, a landmark, and what to do if someone is late.",
        detail:
          "Printed directions, a remembered route, a pay phone, or a message left at home can close the gaps. This is period-informed synthesis, not a claim that every 1998 outing worked this way.",
        grounding: "representative",
        confidence: "medium",
        sourceIds: ["austin-chronicle-1998-12-04"],
      },
      {
        id: "daily-life-sam-friday",
        eyebrow: "A possible Friday night",
        title: "Pizza, one rented tape, and four controller ports",
        summary:
          "Sam imagines pooling cash for pizza, stopping at a video store, and ending up around a Nintendo 64.",
        detail:
          "This scene is fictional reconstruction. It is designed to feel plausible for the setting, but Chrono should label it as Sam's story rather than a documented account of December 4, 1998.",
        grounding: "fictional",
        confidence: "medium",
        sourceIds: [],
      },
    ],
  },
];
