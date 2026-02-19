import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Minus, Plus, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import {
    VictoryArea,
    VictoryAxis,
    VictoryChart,
    VictoryGroup,
    VictoryPie,
    VictoryTheme,
    VictoryVoronoiContainer
} from 'victory-native';
import Header from '../../components/common/Header';

// --- Types ---

interface PlatformData {
    id: string;
    name: string;
    icon: any;
    followers: string;
    growth: string;
    metrics: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
    };
}

// --- Constants ---

const PLATFORMS: PlatformData[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        icon: require('../../assets/icons/instagram.png'),
        followers: '+ 14 followers',
        growth: '+8.2% this month',
        metrics: { views: 10032, likes: 1982, comments: 452, shares: 120 }
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: require('../../assets/icons/tiktok.png'),
        followers: '+ 37 followers',
        growth: '+8.2% this month',
        metrics: { views: 10032, likes: 1982, comments: 10032, shares: 1982 }
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: require('../../assets/icons/facebook.png'),
        followers: '+ 5 followers',
        growth: '+2.1% this month',
        metrics: { views: 5432, likes: 892, comments: 120, shares: 45 }
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: require('../../assets/icons/youtube.png'),
        followers: '+ 120 subscribers',
        growth: '+12.5% this month',
        metrics: { views: 45000, likes: 2100, comments: 750, shares: 320 }
    }
];

// --- Components ---

const SemiCircleGauge = ({ value, total, color, label, subValue1, subLabel1, subValue2, subLabel2 }: any) => {
    const isFirstColor = color === "#FFB800";
    const secondColor = isFirstColor ? "#FB9400" : "#00FF94";

    const totalSweep = 280;
    const chartStartAngle = -120; // 9 o'clock
    const currentRatio = (subValue1 + subValue2) / total;
    const dataEndAngle = chartStartAngle + (totalSweep * currentRatio);

    return (
        <View
            style={{
                width: 147.59,
                height: 172.03,
                borderRadius: 10.31,
                margin: 4,
                overflow: 'hidden',
            }}
        >
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.05)', 'rgba(0, 0, 0, 0)', 'rgba(255, 255, 255, 0)']}
                locations={[0, 0.9999, 1]}
                style={{
                    flex: 1,
                    borderRadius: 10.31,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 16,
                }}
            >
                {/* Gradient Border SVG Overlay */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Svg height="100%" width="100%">
                        <Defs>
                            <SvgGradient id="gaugeBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <Stop offset="0%" stopColor="rgba(99, 97, 97, 0.1)" stopOpacity="1" />
                                <Stop offset="100%" stopColor="rgba(94, 91, 91, 0)" stopOpacity="1" />
                            </SvgGradient>
                        </Defs>
                        <Rect
                            x="0.43"
                            y="0.43"
                            width="146.73"
                            height="171.17"
                            rx="10.31"
                            ry="10.31"
                            stroke="url(#gaugeBorderGrad)"
                            strokeWidth="0.86"
                            fill="transparent"
                        />
                    </Svg>
                </View>

                <View className="items-center w-full mt-4">
                    <View className="w-[140px] h-[90px] items-center justify-center relative">
                        <View className="absolute">
                            <VictoryPie
                                data={[{ y: 1 }]}
                                colorScale={["rgba(255,255,255,0.05)"]}
                                startAngle={-90}
                                endAngle={90}
                                innerRadius={58}
                                radius={60}
                                width={140}
                                height={140}
                                padding={0}
                                labels={() => null}
                            />
                        </View>

                        <VictoryPie
                            data={[
                                { x: '1', y: subValue1 },
                                { x: '2', y: subValue2 },
                            ]}
                            colorScale={[secondColor, color]}
                            startAngle={-120}
                            endAngle={dataEndAngle}
                            innerRadius={56}
                            radius={62}
                            cornerRadius={12}
                            padAngle={4}
                            width={140}
                            height={140}
                            padding={0}
                            labels={() => null}
                            animate={{ duration: 1000 }}
                        />

                        <View className="absolute inset-x-0 bottom-0 items-center pb-4">
                            <View className="bg-[#0A0A0A] px-2.5 py-0.5 rounded-full border border-white/10 mb-2">
                                <Text className="text-white text-[9px] font-inter font-medium tracking-tight">↑ 22.3%</Text>
                            </View>
                            <Text
                                className="text-white text-[28px] text-center"
                                style={{ fontFamily: 'Inter_700Bold', lineHeight: 32 }}
                            >
                                {value.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between w-full px-2.5 mb-2.5">
                        <View className="flex-row gap-1.5 items-center">
                            <View className="w-[2.5px] h-[32px] rounded-full" style={{ backgroundColor: secondColor }} />
                            <View>
                                <Text className="text-white/40 text-[10px] font-inter tracking-tight">{subLabel1}</Text>
                                <Text className="text-white text-[15px] font-inter font-bold leading-tight">{subValue1.toLocaleString()}</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-1.5 items-center">
                            <View className="w-[2.5px] h-[32px] rounded-full" style={{ backgroundColor: color }} />
                            <View>
                                <Text className="text-white/40 text-[10px] font-inter tracking-tight">{subLabel2}</Text>
                                <Text className="text-white text-[15px] font-inter font-bold leading-tight">{subValue2.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const PlatformCard = ({
    platform,
    isExpanded,
    onToggle,
    chartData,
    selectedTab,
    onTabChange,
    screenWidth
}: {
    platform: PlatformData,
    isExpanded: boolean,
    onToggle: () => void,
    chartData: any[],
    selectedTab: string,
    onTabChange: (tab: string) => void,
    screenWidth: number
}) => {
    return (
        <View
            className="platform-card"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 24,
                elevation: 8,
            }}
        >
            <BlurView intensity={14} tint="dark" className="border border-white/10 rounded-[20px]">
                <View className="platform-card-inner">
                    <View className={`flex-row items-center justify-between ${isExpanded ? 'mb-6' : ''}`}>
                        <View className="flex-row items-center">
                            <Image source={platform.icon} className="w-12 h-12 rounded-xl mr-3" />
                            <View>
                                <Text className="platform-name text-white">
                                    {platform.name} <Text className="follower-count text-white/40">{platform.followers}</Text>
                                </Text>
                                <View className="growth-badge flex-row items-center mt-2 self-start gap-[10px]">
                                    <TrendingUp size={14} color="#00FF94" />
                                    <Text className="text-[#00FF94] text-[12px] font-inter font-medium">{platform.growth}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10"
                            onPress={onToggle}
                        >
                            {isExpanded ? <Minus size={20} color="white" /> : <Plus size={20} color="white" />}
                        </TouchableOpacity>
                    </View>

                    {isExpanded && (
                        <>
                            <View className="flex-row justify-between mb-8">
                                <SemiCircleGauge
                                    value={platform.metrics.views + platform.metrics.likes}
                                    total={platform.metrics.views * 1.5}
                                    color="#FFB800"
                                    subLabel1="Views"
                                    subValue1={platform.metrics.views}
                                    subLabel2="Likes"
                                    subValue2={platform.metrics.likes}
                                />
                                <SemiCircleGauge
                                    value={platform.metrics.comments + platform.metrics.shares}
                                    total={platform.metrics.comments * 1.5}
                                    color="#00E0FF"
                                    subLabel1="Comments"
                                    subValue1={platform.metrics.comments}
                                    subLabel2="Shares"
                                    subValue2={platform.metrics.shares}
                                />
                            </View>

                            <View className="mb-6 flex-row items-center justify-between">
                                <Text className="chart-section-title text-white mx-2">30 days</Text>
                                <View className="flex-row items-center gap-[10px]">
                                    {['W1', 'W2', 'W3', 'W4'].map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => onTabChange(tab)}
                                            className={`chart-tab ${selectedTab === tab ? 'chart-tab-active' : ''}`}
                                        >
                                            <Text className={`text-[13px] ${selectedTab === tab ? 'text-white' : 'text-white/40'}`}>{tab}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={{ height: 220, marginLeft: -30, marginBottom: 0 }}>
                                <VictoryChart
                                    width={screenWidth - 10}
                                    height={200}
                                    theme={VictoryTheme.material}
                                    containerComponent={<VictoryVoronoiContainer />}
                                    padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
                                >
                                    <VictoryAxis
                                        style={{
                                            axis: { stroke: 'transparent' },
                                            tickLabels: { fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Inter_400Regular' },
                                            grid: { stroke: 'transparent' }
                                        }}
                                        tickFormat={(t) => Math.round(t)}
                                    />
                                    <VictoryAxis
                                        dependentAxis
                                        style={{
                                            axis: { stroke: 'transparent' },
                                            tickLabels: { fill: 'transparent' },
                                            grid: {
                                                stroke: 'rgba(228, 228, 231, 0.15)',
                                                strokeWidth: 0.8,
                                                strokeDasharray: 'none'
                                            }
                                        }}
                                    />
                                    <VictoryGroup offset={0}>
                                        <VictoryArea
                                            data={chartData}
                                            interpolation="natural"
                                            style={{
                                                data: {
                                                    fill: 'url(#gradLikes)',
                                                    stroke: '#FF9D00',
                                                    strokeWidth: 2
                                                }
                                            }}
                                        />
                                        <VictoryArea
                                            data={chartData.map(d => ({ ...d, y: d.y2 }))}
                                            interpolation="natural"
                                            style={{
                                                data: {
                                                    fill: 'url(#gradViews)',
                                                    stroke: '#00FF94',
                                                    strokeWidth: 2
                                                }
                                            }}
                                        />
                                    </VictoryGroup>

                                    <Defs>
                                        <SvgGradient id="gradLikes" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <Stop offset="0%" stopColor="#FF9D00" stopOpacity="0.3" />
                                            <Stop offset="100%" stopColor="#FF9D00" stopOpacity="0" />
                                        </SvgGradient>
                                        <SvgGradient id="gradViews" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <Stop offset="0%" stopColor="#00FF94" stopOpacity="0.2" />
                                            <Stop offset="100%" stopColor="#00FF94" stopOpacity="0" />
                                        </SvgGradient>
                                    </Defs>
                                </VictoryChart>

                                <View className="flex-row justify-center items-center gap-6 mt-2">
                                    <View className="chart-legend-item gap-2">
                                        <Text className="text-white text-[14px] font-inter">Views</Text>
                                        <View className="chart-legend-dot bg-[#00FF94]" />
                                    </View>
                                    <View className="chart-legend-item gap-2">
                                        <Text className="text-white text-[14px] font-inter">Likes</Text>
                                        <View className="chart-legend-dot bg-[#FF9D00]" />
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </BlurView>
        </View>
    );
};

// --- Dummy Data for Chart ---
const dummyChartData: Record<string, { x: number; y: number; y2: number }[]> = {
    'W1': [
        { x: 1, y: 2, y2: 1 },
        { x: 2, y: 3, y2: 2.2 },
        { x: 3, y: 3.5, y2: 2.0 },
        { x: 4, y: 2, y2: 1.5 },
        { x: 5, y: 3.5, y2: 2.1 },
        { x: 6, y: 4, y2: 2.3 },
        { x: 7, y: 4.2, y2: 2.2 },
    ],
    'W2': [
        { x: 1, y: 1.5, y2: 2.5 },
        { x: 2, y: 2.5, y2: 3.0 },
        { x: 3, y: 2.0, y2: 2.8 },
        { x: 4, y: 3.5, y2: 4.0 },
        { x: 5, y: 3.0, y2: 3.2 },
        { x: 6, y: 2.5, y2: 3.8 },
        { x: 7, y: 3.8, y2: 4.1 },
    ],
    'W3': [
        { x: 1, y: 3.0, y2: 1.2 },
        { x: 2, y: 2.8, y2: 1.8 },
        { x: 3, y: 4.0, y2: 2.5 },
        { x: 4, y: 3.2, y2: 2.0 },
        { x: 5, y: 4.5, y2: 3.0 },
        { x: 6, y: 3.8, y2: 2.8 },
        { x: 7, y: 2.0, y2: 3.5 },
    ],
    'W4': [
        { x: 1, y: 2.2, y2: 1.5 },
        { x: 2, y: 3.5, y2: 2.8 },
        { x: 3, y: 3.0, y2: 2.2 },
        { x: 4, y: 4.2, y2: 3.5 },
        { x: 5, y: 3.8, y2: 3.0 },
        { x: 6, y: 4.8, y2: 4.0 },
        { x: 7, y: 4.5, y2: 3.8 },
    ]
};

export default function Analysis() {
    const { width } = useWindowDimensions();
    const [selectedTab, setSelectedTab] = useState('W1');
    const [expandedPlatform, setExpandedPlatform] = useState('tiktok');

    return (
        <View className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 160
                }}
                showsVerticalScrollIndicator={false}
            >
                <Header />

                <View className="px-5">
                    <Text className="page-title text-white mb-8 mt-3">
                        Your{'\n'}Analytics
                    </Text>

                    <Text className="section-title text-white mb-4">Platform Breakdown</Text>

                    {PLATFORMS.map((platform) => (
                        <PlatformCard
                            key={platform.id}
                            platform={platform}
                            isExpanded={expandedPlatform === platform.id}
                            onToggle={() => setExpandedPlatform(expandedPlatform === platform.id ? '' : platform.id)}
                            chartData={dummyChartData[selectedTab]}
                            selectedTab={selectedTab}
                            onTabChange={setSelectedTab}
                            screenWidth={width}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
