-- EDEN Connect — Community Profiles with CHE stage tracking

CREATE TABLE IF NOT EXISTS community_profiles (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     TEXT NOT NULL,
  province                 TEXT NOT NULL,
  district                 TEXT,
  population               INTEGER,
  latitude                 DECIMAL(9,6) NOT NULL,
  longitude                DECIMAL(9,6) NOT NULL,
  che_stage                TEXT NOT NULL DEFAULT 'kicked_off'
                             CHECK (che_stage IN ('kicked_off', 'in_progress', 'achieved')),
  description              TEXT,
  health_committee_contact TEXT,
  photo_url                TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read community profiles"
  ON community_profiles FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert community profiles"
  ON community_profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update community profiles"
  ON community_profiles FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- SEED DATA — 100 communities across PNG Highlands
-- ============================================================

INSERT INTO community_profiles (name, province, district, population, latitude, longitude, che_stage, description) VALUES

-- EASTERN HIGHLANDS PROVINCE (45 villages)
-- Goroka District
('Konogogo',      'Eastern Highlands', 'Goroka',           280, -6.0912,  145.3654, 'in_progress', 'Village at 1800m near Goroka. Health committee active since 2023, focusing on malaria and nutrition.'),
('Marifutu',      'Eastern Highlands', 'Goroka',           145, -6.1234,  145.4123, 'achieved',    'Pioneering healthy village in Goroka district. First community to complete all WASH goals.'),
('Asaroka',       'Eastern Highlands', 'Goroka',           320, -6.0567,  145.3312, 'in_progress', 'Large village near Asaro River. Water sanitation project completed 2024.'),
('Nagamizuha',    'Eastern Highlands', 'Goroka',           195, -6.0789,  145.4567, 'kicked_off',  'Coffee-growing community. Joined CHE program in late 2024.'),
('Dunantina',     'Eastern Highlands', 'Goroka',           410, -6.1456,  145.2890, 'in_progress', 'Valley community with access to Goroka General Hospital. Active CHW team.'),
('Numuru',        'Eastern Highlands', 'Goroka',           167, -6.0345,  145.3890, 'achieved',    'Model community for nutrition. Achieved healthy village 2024.'),
('Kabiufa',       'Eastern Highlands', 'Goroka',           234, -6.0678,  145.4234, 'in_progress', 'Near SDA mission station. Strong women''s health committee.'),
('Miruma',        'Eastern Highlands', 'Goroka',           189, -6.1123,  145.3456, 'kicked_off',  'New to program. Community mobilisation meetings held Jan 2025.'),
('Sonofi',        'Eastern Highlands', 'Goroka',           298, -6.0890,  145.4890, 'in_progress', 'Roadside community on Highlands Highway. Good clinic access.'),
('Kafe',          'Eastern Highlands', 'Goroka',           356, -6.1567,  145.3789, 'in_progress', 'Kafe language group. Focus on malaria prevention and child nutrition.'),

-- Unggai-Bena District
('Benabena',      'Eastern Highlands', 'Unggai-Bena',      445, -6.0456,  145.5234, 'achieved',    'Strong health committee. Completed all 3 WASH goals and healthy homes survey.'),
('Watabung',      'Eastern Highlands', 'Asaro-Watabung',   312, -6.0234,  145.4678, 'in_progress', 'Highland valley community. Road access improved 2024.'),
('Korofeigu',     'Eastern Highlands', 'Unggai-Bena',      178, -6.0678,  145.5678, 'kicked_off',  'Remote Bena-speaking village. First CHW trained October 2024.'),
('Unggai',        'Eastern Highlands', 'Unggai-Bena',      267, -6.0901,  145.5012, 'in_progress', 'Accessible by road. Cooperative community with high health meeting attendance.'),

-- Henganofi District
('Henganofi',     'Eastern Highlands', 'Henganofi',        523, -6.1890,  145.5890, 'in_progress', 'District centre community. Health post on-site.'),
('Nupura',        'Eastern Highlands', 'Henganofi',        145, -6.2123,  145.6234, 'kicked_off',  'Small mountain village. Road access seasonal only.'),
('Kafaina',       'Eastern Highlands', 'Henganofi',        198, -6.2456,  145.5567, 'in_progress', 'Kamano-speaking community. Active TB screening program 2024.'),
('Yagusa',        'Eastern Highlands', 'Henganofi',        234, -6.1678,  145.6012, 'kicked_off',  'Joined program after neighbouring village showed results.'),
('Kamiraka',      'Eastern Highlands', 'Henganofi',        312, -6.2012,  145.5345, 'in_progress', 'Large village serving as CHE hub for 3 surrounding communities.'),
('Kamano',        'Eastern Highlands', 'Henganofi',        289, -6.2345,  145.6456, 'in_progress', 'Kamano language group. Strong traditional leadership supporting program.'),

-- Kainantu District
('Kainantu',      'Eastern Highlands', 'Kainantu',         780, -6.2833,  145.8667, 'achieved',    'District town. Pilot site for EDEN Connect integration with health facility.'),
('Aiyura',        'Eastern Highlands', 'Kainantu',         345, -6.3123,  145.9012, 'in_progress', 'Near national agricultural research station. Educated community.'),
('Tompena',       'Eastern Highlands', 'Kainantu',         156, -6.3456,  145.8345, 'kicked_off',  'Gadsup-speaking community. Training commenced Feb 2025.'),
('Onkena',        'Eastern Highlands', 'Kainantu',         223, -6.2678,  145.9234, 'in_progress', 'Valley community with reliable river water access.'),
('Aziana',        'Eastern Highlands', 'Kainantu',         189, -6.3012,  145.7890, 'kicked_off',  'Remote community. Access by foot only in wet season.'),
('Suwaira',       'Eastern Highlands', 'Kainantu',         267, -6.3234,  145.9678, 'in_progress', 'Agarabi language group. Women''s group driving CHE activities.'),
('Omaura',        'Eastern Highlands', 'Kainantu',         145, -6.2456,  145.8012, 'in_progress', 'Small community near Ramu River headwaters.'),
('Gadsup',        'Eastern Highlands', 'Kainantu',         312, -6.3678,  145.9123, 'achieved',    'Second community in Kainantu to achieve healthy village status.'),
('Tairora',       'Eastern Highlands', 'Kainantu',         198, -6.2890,  146.0012, 'in_progress', 'Tairora-speaking village. Strong traditional birth attendant network.'),

-- Obura-Wonenara District
('Obura',         'Eastern Highlands', 'Obura-Wonenara',   456, -6.6234,  145.9012, 'in_progress', 'District centre. Airstrip allows medical supply access.'),
('Wonenara',      'Eastern Highlands', 'Obura-Wonenara',   234, -6.8012,  145.9678, 'kicked_off',  'Very remote. Accessible by air only. High malaria burden.'),
('Purosa',        'Eastern Highlands', 'Obura-Wonenara',   167, -6.7234,  145.8345, 'kicked_off',  'Fore-speaking community. Strong interest in health program.'),
('Okapa',         'Eastern Highlands', 'Obura-Wonenara',   389, -6.5678,  145.8012, 'in_progress', 'Okapa health centre community. TB historically high in area.'),
('Ilakia',        'Eastern Highlands', 'Obura-Wonenara',   145, -6.7890,  146.0234, 'kicked_off',  'Highland fringe community. Subsistence farming.'),
('Fore',          'Eastern Highlands', 'Obura-Wonenara',   278, -6.6890,  145.7678, 'in_progress', 'Fore language group. Historical kuru research site now model health community.'),

-- Lufa District
('Lufa',          'Eastern Highlands', 'Lufa',             412, -6.4678,  145.2345, 'in_progress', 'District centre for Lufa. Coffee and cardamom growing area.'),
('Seigu',         'Eastern Highlands', 'Lufa',             178, -6.5012,  145.1890, 'kicked_off',  'Remote ridge community. Poor road access.'),
('Kefamo',        'Eastern Highlands', 'Lufa',             234, -6.4234,  145.2890, 'in_progress', 'Near Kefamo agricultural college. Community garden project active.'),

-- Daulo District
('Daulo Pass',    'Eastern Highlands', 'Daulo',            189, -5.9456,  145.2567, 'kicked_off',  'High altitude community at 2400m. Cold climate challenges for health.'),
('Asaro',         'Eastern Highlands', 'Asaro-Watabung',   567, -6.0012,  145.3234, 'in_progress', 'Famous mud men village. Strong tourism and community development.'),
('Kefiyagufa',    'Eastern Highlands', 'Asaro-Watabung',   234, -6.0345,  145.2890, 'achieved',    'Asaro Valley community. Won provincial healthy village award 2024.'),
('Kama',          'Eastern Highlands', 'Asaro-Watabung',   156, -5.9789,  145.3567, 'in_progress', 'Small Asaro Valley community with active youth group.'),
('Goroka',        'Eastern Highlands', 'Goroka',          4200, -6.0833,  145.3833, 'achieved',    'Provincial capital. Full health services available. CHE coordination hub.'),
('Kamaliki',      'Eastern Highlands', 'Goroka',           198, -6.1012,  145.3123, 'in_progress', 'Peri-urban community near Goroka town. Health awareness high.'),

-- SIMBU PROVINCE (20 villages)
('Kundiawa',      'Simbu',             'Kundiawa-Gembogl', 3200, -6.0167, 144.9667, 'achieved',    'Simbu provincial capital. Well-resourced health facility. CHE model site.'),
('Gembogl',       'Simbu',             'Kundiawa-Gembogl',  312, -5.9678, 144.9234, 'in_progress', 'Kundiawa highland community. Strong church partnership with CHE.'),
('Waiye',         'Simbu',             'Kundiawa-Gembogl',  178, -6.0456, 144.8890, 'in_progress', 'Mountain village above Kundiawa. Accessible by PMV.'),
('Minima',        'Simbu',             'Gumine',             145, -6.2012, 144.8234, 'kicked_off',  'Remote Gumine community. Health committee formed March 2025.'),
('Gumine',        'Simbu',             'Gumine',             456, -6.2234, 144.8567, 'in_progress', 'District centre. Gumine health centre active partner.'),
('Pari',          'Simbu',             'Gumine',             189, -6.2678, 144.7890, 'kicked_off',  'Coffee-growing community. Women''s group expressed interest in CHE.'),
('Goglme',        'Simbu',             'Gumine',             234, -6.1890, 144.9012, 'in_progress', 'Kuman-speaking community with established school and aid post.'),
('Amrai',         'Simbu',             'Gumine',             167, -6.3012, 144.8012, 'kicked_off',  'Very remote. Foot access only. Prioritised for next phase.'),
('Kerowagi',      'Simbu',             'Kerowagi',           534, -5.9012, 145.0456, 'in_progress', 'Fertile valley community. Malnutrition rates falling since program started.'),
('Domara',        'Simbu',             'Kerowagi',           178, -5.8678, 145.0123, 'in_progress', 'Near Kerowagi station. Road access good.'),
('Kindeng',       'Simbu',             'Kerowagi',           234, -5.9345, 144.9890, 'achieved',    'Healthy village achieved 2024. Now mentoring neighbouring communities.'),
('Chuave',        'Simbu',             'Chuave',             445, -6.0678, 145.1012, 'in_progress', 'Chuave district. Close to Goroka border. Good clinic access.'),
('Koge',          'Simbu',             'Chuave',             189, -6.1012, 145.0678, 'kicked_off',  'Hillside community accessible in dry season only.'),
('Gena',          'Simbu',             'Chuave',             156, -6.0890, 145.1345, 'in_progress', 'Active church community driving health improvements.'),
('Sinesine',      'Simbu',             'Sinasina-Yonggamugl',389, -6.0234, 144.9345, 'in_progress', 'Sinasina river valley. Strong traditional leadership.'),
('Yonggamugl',    'Simbu',             'Sinasina-Yonggamugl',267, -5.9890, 144.8678, 'kicked_off',  'Yonggamugl area. Interest expressed after EDEN Connect awareness meeting.'),
('Tigi',          'Simbu',             'Sinasina-Yonggamugl',145, -6.0567, 144.8234, 'kicked_off',  'Small family community. Road constructed 2023 improving access.'),
('Nomane',        'Simbu',             'Karimui-Nomane',     312, -6.5678, 144.8012, 'kicked_off',  'Very remote. Accessible by charter flight. High disease burden.'),
('Karimui',       'Simbu',             'Karimui-Nomane',     456, -6.4890, 144.8234, 'kicked_off',  'Lowland fringe community. Malaria and TB significant concerns.'),
('Soso',          'Simbu',             'Karimui-Nomane',     167, -6.5234, 144.7678, 'kicked_off',  'Isolated plateau community. First health worker training 2025.'),

-- WESTERN HIGHLANDS PROVINCE (20 villages)
('Mt Hagen',      'Western Highlands', 'Hagen',            8500, -5.8522, 144.2213, 'achieved',    'WHP provincial capital. Major health hub. CHE coordination centre for Western Highlands.'),
('Togoba',        'Western Highlands', 'Hagen',             378, -5.8012, 144.2567, 'in_progress', 'Peri-urban Hagen community. Active health committee.'),
('Keltiga',       'Western Highlands', 'Hagen',             234, -5.8678, 144.1890, 'in_progress', 'Near Hagen airport. Mixed farming community.'),
('Kuma',          'Western Highlands', 'Hagen',             189, -5.9012, 144.2890, 'kicked_off',  'Kuma Valley community. Joined program 2025.'),
('Kotna',         'Western Highlands', 'Hagen',             312, -5.8234, 144.3234, 'in_progress', 'Wahgi Valley farm community. Vegetable growers cooperative.'),
('Kagamuga',      'Western Highlands', 'Hagen',             445, -5.8456, 144.2678, 'achieved',    'Near Kagamuga airport. Well-established community health program.'),
('Ruti',          'Western Highlands', 'Hagen',             178, -5.9234, 144.1567, 'kicked_off',  'Remote western Hagen community. Access by unsealed road.'),
('Kangan',        'Western Highlands', 'Hagen',             267, -5.8789, 144.3012, 'in_progress', 'Wahgi Valley. Coffee and tea plantations employing community.'),
('Poiya',         'Western Highlands', 'Hagen',             189, -5.9456, 144.2345, 'kicked_off',  'Highland community. Health post recently rehabilitated.'),
('Gumanch',       'Western Highlands', 'Hagen',             234, -5.8123, 144.1234, 'in_progress', 'Western Hagen. Strong women''s group involvement in health program.'),
('Nebilyer',      'Western Highlands', 'Tambul-Nebilyer',   312, -6.0567, 143.9890, 'in_progress', 'Nebilyer Valley. Fertile area. Health committee very active.'),
('Tambul',        'Western Highlands', 'Tambul-Nebilyer',   534, -6.0234, 144.0234, 'in_progress', 'District centre. Health centre serving wide catchment.'),
('Kindip',        'Western Highlands', 'Tambul-Nebilyer',   156, -6.0890, 143.9456, 'kicked_off',  'Remote Nebilyer community. First CHW trained 2024.'),
('Tindom',        'Western Highlands', 'Hagen',             189, -5.9678, 144.3456, 'kicked_off',  'Peri-urban community. Good school facilities.'),
('Dei',           'Western Highlands', 'Dei',               478, -5.7890, 144.2890, 'in_progress', 'North of Hagen. Ramu-Wahgi divide area.'),
('Mul',           'Western Highlands', 'Mul-Baiyer',        312, -5.7234, 144.1890, 'kicked_off',  'Mul River community. Access road completed 2022.'),
('Baiyer',        'Western Highlands', 'Mul-Baiyer',        267, -5.6890, 144.1234, 'in_progress', 'Baiyer River Valley. Remote but committed community.'),
('Anglimp',       'Western Highlands', 'Anglimp-South Wahgi',389, -5.8345, 144.4567, 'in_progress', 'South Wahgi valley. Farming community with young health committee.'),
('Koge Station',  'Western Highlands', 'Hagen',             145, -5.9123, 144.2012, 'kicked_off',  'Small station community. Catholic mission present.'),
('Ku',            'Western Highlands', 'Hagen',             178, -5.8901, 144.1678, 'in_progress', 'Highland community accessible year-round. Active CHW program.'),

-- JIWAKA PROVINCE (10 villages)
('Minj',          'Jiwaka',            'Jiwaka',            1200, -5.8667, 144.6667, 'in_progress', 'Jiwaka provincial centre. Wahgi Valley. Major health facility nearby.'),
('Banz',          'Jiwaka',            'Jiwaka',             890, -5.7890, 144.6234, 'in_progress', 'Banz agricultural research station community. Health awareness high.'),
('Kudjip',        'Jiwaka',            'Jiwaka',             567, -5.8012, 144.5890, 'achieved',    'Kudjip Nazarene Hospital community. Strong faith-based health model.'),
('Nondugl',       'Jiwaka',            'Jiwaka',             312, -5.8456, 144.7012, 'in_progress', 'Wildlife management area border. Mixed community.'),
('Tabibuga',      'Jiwaka',            'Jimi',               234, -5.7234, 144.4890, 'kicked_off',  'Jimi River valley. Remote community, access by river track.'),
('Jimi',          'Jiwaka',            'Jimi',               456, -5.6890, 144.3890, 'kicked_off',  'Jimi River community. Very remote. Helicopter access in emergencies.'),
('Simbai',        'Jiwaka',            'Jimi',               389, -5.6234, 144.5234, 'kicked_off',  'Remote Simbai area. Airstrip provides occasional access.'),
('Togba',         'Jiwaka',            'Jiwaka',             189, -5.8901, 144.6456, 'in_progress', 'Wahgi Valley. Coffee-growing community.'),
('Kawbenk',       'Jiwaka',            'Jiwaka',             167, -5.8123, 144.7234, 'in_progress', 'Near Minj. Good road access. Health committee formed 2023.'),
('Mondege',       'Jiwaka',            'Jiwaka',             234, -5.8678, 144.5567, 'in_progress', 'Wahgi Valley farming community. Joining healthy village program.'),

-- ENGA PROVINCE (5 villages)
('Wabag',         'Enga',              'Wabag',             2100, -5.4833, 143.7167, 'in_progress', 'Enga provincial capital. High altitude. Cold climate affects health patterns.'),
('Wapenamanda',   'Enga',              'Wapenamanda',        890, -5.6234, 143.8890, 'in_progress', 'Enga Highway community. Large health centre.'),
('Laiagam',       'Enga',              'Laiagam',            567, -5.5012, 143.5234, 'kicked_off',  'Remote Enga community. Road access improved 2023.'),
('Kandep',        'Enga',              'Kandep',             445, -5.8456, 143.5678, 'kicked_off',  'High altitude Kandep district. Cold climate. Malnutrition concern.'),
('Kompiam',       'Enga',              'Kompiam-Ambum',      312, -5.4567, 144.0234, 'in_progress', 'Ambum Valley community. Accessible health post.');
