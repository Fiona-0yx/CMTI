const contestWeights = [
  {name:'中国软件杯',field:'软件系统开发',weights:{A:15,E:60,I:20,S:5,H:0,M:0}},
  {name:'中国机器人大赛 / RoboCup',field:'机器人与人工智能',weights:{A:5,E:25,I:10,S:5,H:55,M:0}},
  {name:'中国水下机器人',field:'水下机器人',weights:{A:0,E:25,I:10,S:0,H:60,M:5}},
  {name:'全国大学生机械创新设计大赛',field:'机械创新设计',weights:{A:0,E:30,I:45,S:0,H:25,M:0}},
  {name:'西门子杯智能制造挑战赛',field:'智能制造',weights:{A:5,E:45,I:20,S:0,H:30,M:0}},
  {name:'中国大学生计算机设计大赛',field:'计算机设计',weights:{A:15,E:45,I:35,S:0,H:5,M:0}},
  {name:'中国高校计算机大赛',field:'计算机综合能力',weights:{A:25,E:45,I:25,S:5,H:0,M:0}},
  {name:'蓝桥杯',field:'算法与程序设计',weights:{A:75,E:15,I:5,S:0,H:0,M:5}},
  {name:'全国大学生集成电路创新创业大赛',field:'集成电路创新',weights:{A:5,E:25,I:45,S:0,H:25,M:0}},
  {name:'全国大学生创新创业训练计划年会展示',field:'创新创业与研究展示',weights:{A:0,E:15,I:40,S:0,H:0,M:45}},
  {name:'中国机器人大赛及人工智能大赛',field:'机器人与人工智能',weights:{A:10,E:35,I:35,S:0,H:20,M:0}},
  {name:'大唐杯 5G 技术大赛',field:'5G 技术与应用',weights:{A:10,E:40,I:15,S:5,H:30,M:0}},
  {name:'全国高校数字艺术设计大赛',field:'数字艺术设计',weights:{A:5,E:25,I:55,S:0,H:0,M:15}},
  {name:'全国虚拟仪器大赛',field:'虚拟仪器与工程',weights:{A:5,E:45,I:15,S:0,H:35,M:0}},
  {name:'强网杯',field:'网络安全攻防',weights:{A:20,E:15,I:10,S:55,H:0,M:0}},
  {name:'全国大学生工程训练综合能力竞赛',field:'工程训练',weights:{A:0,E:35,I:40,S:0,H:25,M:0}},
  {name:'全国三维数字化创新设计大赛',field:'三维数字化创新',weights:{A:0,E:30,I:50,S:0,H:20,M:0}},
  {name:'中国软件开源创新大赛',field:'软件开源创新',weights:{A:20,E:45,I:30,S:5,H:0,M:0}},
  {name:'中国高校智能机器人创意赛',field:'智能机器人创意',weights:{A:5,E:30,I:40,S:0,H:25,M:0}},
  {name:'华为 ICT 大赛',field:'ICT 技术',weights:{A:20,E:50,I:20,S:10,H:0,M:0}},
  {name:'全国大学生数学建模竞赛',field:'数学建模',weights:{A:20,E:10,I:15,S:0,H:0,M:55}},
  {name:'网信柏鹭杯',field:'网络安全攻防',weights:{A:20,E:15,I:10,S:55,H:0,M:0}},
  {name:'福建省大学生单片机应用设计竞赛',field:'单片机应用设计',weights:{A:5,E:35,I:15,S:0,H:45,M:0}},
  {name:'海峡两岸信息服务创新 / 福建省软件设计',field:'信息服务与软件设计',weights:{A:15,E:50,I:30,S:5,H:0,M:0}},
  {name:'百度智能云杯福建 AI 产业实践大赛',field:'AI 产业实践',weights:{A:15,E:45,I:35,S:5,H:0,M:0}},
  {name:'福建省大学生程序设计竞赛',field:'程序设计竞赛',weights:{A:80,E:10,I:5,S:0,H:0,M:5}}
];

if (typeof module !== 'undefined' && module.exports) module.exports = contestWeights;
if (typeof globalThis !== 'undefined') globalThis.CMTI_CONTESTS = contestWeights;
