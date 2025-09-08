// App.js (FULL) — PHIÊN BẢN HOÀN THIỆN: Gửi thông báo hệ thống thật
// - Font: Manrope-800/400/500/600
// - Đảm bảo bạn đã tải và chép bộ logo mới vào thư mục /assets/logos
// - Đảm bảo đã cài đặt: npx expo install expo-notifications

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StatusBar, SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ImageBackground, Dimensions, Image, Alert, Modal,
  KeyboardAvoidingView, Platform, FlatList, TouchableWithoutFeedback, Keyboard,
  Animated, Easing
} from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Device from 'expo-device';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications'; // Sửa đổi: Thêm import cho thông báo

// Sửa đổi: Cấu hình cách ứng dụng xử lý thông báo khi đang chạy (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Hiển thị thông báo
    shouldPlaySound: true, // Phát âm thanh
    shouldSetBadge: false, // Không thay đổi số trên icon app
  }),
});


// ===== ASSETS =====
import Logo from './assets/logo.png'; // Sửa đổi: Thêm logo mới
import BgLogin from './assets/bg-login.jpg';
import BgLogin2 from './assets/bg-login-2.jpg';
import BgLogin3 from './assets/bg-login-3.jpg';
import BgTransfer from './assets/bg-login-4.jpg';
import BottomContinue from './assets/bottom-continue.png';
import BottomOverlay from './assets/bottom-overlay.png';
import HeaderTransfer from './assets/header-transfer.png';
import BgConfirm from './assets/bg-login-5.jpg';
import HeaderConfirm from './assets/header-transfer-2.png';
import BottomConfirm from './assets/bottom-continue-2.png';
import BgSuccess from './assets/success.jpg';
import BottomOverlaySuccess from './assets/overlay-end.png';

const Stack = createNativeStackNavigator();

// ===== CONSTANTS =====
const G1 = '#33cc66';
const G2 = '#009245';
const { width: SW, height: SH } = Dimensions.get('window');
const FONT_HEAVY      = 'Manrope-800'; // Đậm nhất
const FONT_BOLD       = 'Manrope-700';
const FONT_SEMI       = 'Manrope-600';
const FONT_MEDIUM     = 'Manrope-500';
const FONT_REG        = 'Manrope-400'; // Thông thường
const FONT_LIGHT      = 'Manrope-300';
const FONT_EXTRALIGHT = 'Manrope-200'; // Nhạt nhất
/* ================== VỊ TRÍ / OFFSET DỄ CHỈNH SỬA ================== */
// === HOME SCREEN ===
const HOME_LAYOUT = {
  NAME_OFFSET_X: 0,
  NAME_OFFSET_Y: -62,
  ACC_OFFSET_X: 30,
  ACC_OFFSET_Y: -108,
  BAL_OFFSET_X: 22,
  BAL_OFFSET_Y: -132,
  BAL_SPACING: 3,
  EYE_GAP_HIDDEN: 27,
  EYE_GAP_VISIBLE: 2,
  EYE_OPACITY: 0.8,
};

// === TRANSFER SCREEN ===
const TRANSFER_LAYOUT = {
  PIXEL_OFFSETS: {
    bankLogo: { x: 0, y: 0 },
    bankName: { x: 0, y: 0 },
  },
  LABEL_SHIFT: 0.045,
  NAME_WIDTH_PCT: 0.65,
};
/* ================================================================ */


// ===== DATA CHO MODAL DANH MỤC CHI =====
const SPENDING_CATEGORIES = [
  { main: 'Chi tiêu thiết yếu', sub: ['Đi chợ siêu thị', 'Nhà hàng', 'Chi trả hoá đơn', 'Tiền nhà', 'Đi lại', 'Giúp việc', 'Khác'] },
  { main: 'Mua sắm Giải trí', sub: ['Thời trang mỹ phẩm', 'Thiết bị điện tử', 'Sách & VPP', 'Xem phim & Nghe nhạc', 'Du lịch', 'Cafe & Bạn bè'] },
  { main: 'Giáo dục', sub: ['Học phí', 'Dụng cụ học tập', 'Các khoá học online'] },
  { main: 'Sức khoẻ', sub: ['Khám chữa bệnh', 'Thuốc & Thực phẩm CN', 'Bảo hiểm'] },
];

function BankLogo({ localSource, size = 36 }) {
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      <Image
        source={localSource}
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ===== CURRENCY FORMATTING HELPER =====
const formatVNCurrency = (n) => {
  if (n === null || n === undefined || n === '') return '';
  const num = Number(String(n).replace(/\D/g, '') || '0');
  // toLocaleString('vi-VN') uses '.' as thousands separator.
  // We replace it with ',' as requested.
  return num.toLocaleString('vi-VN').replace(/\./g, ',');
};


/* =========================================================
   APP
========================================================= */
export default function App() {
  const [phone, setPhone] = useState('0961234590');
  const [username, setUsername] = useState('MA DINH TAO');
  const [accountNo, setAccountNo] = useState('9967070690');
  const [fontsReady, setFontsReady] = useState(false);
  const [balance, setBalance] = useState(12345);
  
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          'Manrope-800': require('./assets/fonts/Manrope-ExtraBold.ttf'),   //
          'Manrope-700': require('./assets/fonts/Manrope-Bold.ttf'),         //
          'Manrope-600': require('./assets/fonts/Manrope-SemiBold.ttf'),     //
          'Manrope-500': require('./assets/fonts/Manrope-Medium.ttf'),       //
          'Manrope-400': require('./assets/fonts/Manrope-Regular.ttf'),      //
          'Manrope-300': require('./assets/fonts/Manrope-Light.ttf'),        //
          'Manrope-200': require('./assets/fonts/Manrope-ExtraLight.ttf'),   //
        });
      } finally {
        setFontsReady(true);
      }
    })();
  }, []);

  if (!fontsReady) {
    return (
      <View style={{ flex:1, backgroundColor:'#000', alignItems:'center', justifyContent:'center' }}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color:'#fff', opacity:0.7 }}>Đang tải font…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator initialRouteName="Login1" screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }}>
        <Stack.Screen name="Login1">{props => <LoginStep1 {...props} phone={phone} setPhone={setPhone} />}</Stack.Screen>
        <Stack.Screen name="Login2">{props => <LoginStep2 {...props} username={username} />}</Stack.Screen>
        <Stack.Screen name="Home">{props => <Home {...props} username={username} accountNo={accountNo} balance={balance} setUsername={setUsername} setAccountNo={setAccountNo} setBalance={setBalance} />}</Stack.Screen>
        <Stack.Screen name="Transfer">{props => <Transfer {...props} username={username} srcAcc={accountNo} balance={balance} phone={phone} />}</Stack.Screen>
        <Stack.Screen name="Confirm" component={Confirm} />
        <Stack.Screen name="Success" component={Success} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* =========================================================
   LOGIN STEP 1 — tự nâng cụm khi nhập & hạ xuống chuẩn
========================================================= */
function LoginStep1({ navigation, phone, setPhone }) {
  const TARGET_UP = SH * 0.36;   // vị trí giữa màn khi nhập
  const TARGET_DOWN = SH * 0.62; // vị trí mặc định
  const animY = useRef(new Animated.Value(TARGET_DOWN)).current;

  const animateTo = (to) =>
    Animated.timing(animY, { toValue: to, duration: 220, useNativeDriver: false }).start();

  const onFocus = () => animateTo(TARGET_UP);
  const onBlur  = () => animateTo(TARGET_DOWN);

  // đảm bảo hạ xuống khi đóng bàn phím số (khi onBlur không bắn)
  useEffect(() => {
    const evt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const sub = Keyboard.addListener(evt, () => animateTo(TARGET_DOWN));
    return () => sub.remove();
  }, []);

  const onPhoneChange = (t) => {
    const digits = t.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (digits.length === 10) setTimeout(() => navigation.navigate('Login2'), 150);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Nền phủ kín, tránh viền đen */}
      <ImageBackground source={BgLogin} style={StyleSheet.absoluteFillObject} resizeMode="stretch" />

      {/* ENG pill */}
      <View style={styles.langPill}>
        <Text style={styles.langFlag}>🇬🇧</Text>
        <Text style={styles.langText}> ENG</Text>
      </View>

      {/* Chạm ngoài để đóng bàn phím */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior="padding" style={StyleSheet.absoluteFill}>
          {/* Cụm chính trượt lên/xuống */}
          <Animated.View
            style={{
              position: 'absolute',
              top: animY,
              left: 0,
              right: 0,
              paddingHorizontal: 16, // full theo khoảng trắng an toàn 16px
            }}
          >
            <Text
              style={{
                marginTop: 60,
                marginBottom: 10,
                color: 'rgba(255,255,255,0.95)',
                fontSize: 14,
                fontFamily: FONT_SEMI,
                textShadowColor: 'rgba(0,0,0,0.35)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              Vui lòng nhập thông tin đăng nhập
            </Text>

            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color="#222" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.phoneInput}         // nhớ phoneInput: {flex:1, height:'100%', fontSize:16, color:'#111'}
                value={phone}
                onChangeText={onPhoneChange}
                keyboardType="number-pad"
                placeholder="Tên đăng nhập/Số điện thoại"
                placeholderTextColor="rgba(0,0,0,0.35)"
                onFocus={onFocus}
                onBlur={onBlur}
                returnKeyType="done"
                blurOnSubmit
              />
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={() => {}} style={{ marginTop: 25 }}>
              <LinearGradient
                colors={['#56ab2f', '#00642B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.expBtn}
              >
                <Ionicons name="star-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.expText}>Trải nghiệm không cần tài khoản</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

/* =========================================================
   LOGIN STEP 2
========================================================= */
function LoginStep2({ navigation, username }) {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const HELLO_TOP = SH * 0.485;
  const BLOCK_TOP = SH * 0.535;
  async function authenticate() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return Alert.alert("Thiết bị không hỗ trợ Face ID/Touch ID");
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return Alert.alert("Chưa cài Face ID/Touch ID trong cài đặt");
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Đăng nhập bằng Face ID", fallbackLabel: "Nhập mật khẩu", disableDeviceFallback: false });
    if (result.success) navigation.replace('Home'); else Alert.alert("Xác thực thất bại");
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BgLogin2} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <View style={{ position: 'absolute', top: HELLO_TOP, left: 135, right: 16 }}><Text style={{ color: '#fff', fontSize: 16 }}>Xin chào, <Text style={{ fontFamily: FONT_HEAVY }}>{username}</Text></Text></View>
      <View style={{ position: 'absolute', left: 25, right: 25, top: BLOCK_TOP }}>
        <View style={styles.pwdRow}><Ionicons name="lock-closed-outline" size={20} color="#222" style={{ marginRight: 8 }} /><TextInput style={styles.pwdInput} value={password} onChangeText={setPassword} placeholder="Mật khẩu" secureTextEntry={!showPwd} placeholderTextColor="rgba(0,0,0,0.35)" /><TouchableOpacity onPress={() => setShowPwd(v => !v)} style={{ padding: 6 }}><Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#444" /></TouchableOpacity></View>
        <TouchableOpacity activeOpacity={1} onPress={() =>
  navigation.reset({
    index: 1,
    routes: [
      { name: 'Login2' },
      { name: 'Home' }
    ],
  })
} style={{ marginTop: 15, marginLeft: 1 }}><LinearGradient colors={[G1, G2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.loginBtn, { width: 290 }]}><Text style={styles.loginBtnText}>Đăng nhập</Text></LinearGradient></TouchableOpacity>
      </View>
      <TouchableOpacity onPress={authenticate} style={{ position: 'absolute', top: BLOCK_TOP + 64, left: 323, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} />
    </View>
  );
}

/* =========================================================
   HOME
========================================================= */
function Home({ navigation, username, accountNo, balance, setUsername, setAccountNo, setBalance }) {
  const { width: OIMG_W, height: OIMG_H } = Image.resolveAssetSource(BottomOverlay);
  const OVER_H = SW * (OIMG_H / OIMG_W);
  const { width: IMG_W, height: IMG_H } = Image.resolveAssetSource(BgLogin3);
  const ratio = IMG_H / IMG_W;
  const H = SW * ratio;
  const PCT_TEXT_LEFT = 0.17, PCT_USERNAME_Y = 0.175, PCT_ACCNUM_Y = 0.22, PCT_BALANCE_Y = 0.245;
  const { NAME_OFFSET_X, NAME_OFFSET_Y, ACC_OFFSET_X, ACC_OFFSET_Y, BAL_OFFSET_X, BAL_OFFSET_Y, BAL_SPACING, EYE_GAP_HIDDEN, EYE_GAP_VISIBLE, EYE_OPACITY } = HOME_LAYOUT;
  
  const nameTop = H * PCT_USERNAME_Y + NAME_OFFSET_Y, nameLeft = SW * PCT_TEXT_LEFT + NAME_OFFSET_X;
  const accTop = H * PCT_ACCNUM_Y + ACC_OFFSET_Y, balTop = H * PCT_BALANCE_Y + BAL_OFFSET_Y, balLeft = SW * PCT_TEXT_LEFT + ACC_OFFSET_X + BAL_OFFSET_X;
  const [balanceVisible, setBalanceVisible] = useState(false);
  const eyeGap = balanceVisible ? EYE_GAP_VISIBLE : EYE_GAP_HIDDEN;
  const [showEditModal, setShowEditModal] = useState(false);
  const [tmpName, setTmpName] = useState(username), [tmpAcc, setTmpAcc] = useState(accountNo), [tmpBal, setTmpBal] = useState(String(balance));
  const openEdit = () => { setTmpName(username); setTmpAcc(accountNo); setTmpBal(String(balance)); setShowEditModal(true); };
  const saveBoth = () => { setUsername((tmpName || '').trim() || username); setAccountNo((tmpAcc || '').replace(/\D/g, '') || accountNo); setBalance(parseInt((tmpBal || '0').replace(/\D/g, ''), 10)); setShowEditModal(false); };
  const eyeLabel = useMemo(() => (balanceVisible ? 'Ẩn số dư' : 'Hiện số dư'), [balanceVisible]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: SW, height: H }}>
          <ImageBackground source={BgLogin3} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

          <Text
            style={{ position:'absolute', top:nameTop, left:nameLeft, fontSize:14, color:'#fff', fontFamily: FONT_HEAVY }}
            numberOfLines={1}
          >
            {username}
          </Text>

          <Text
            style={{ position:'absolute', top:266, left:118, fontSize:14, letterSpacing: 0.9, color:'#fff', fontFamily: FONT_HEAVY }}
            numberOfLines={1}
          >
            {accountNo}
          </Text>

          <View style={{ position:'absolute', top:balTop, left:balLeft, flexDirection:'row', alignItems:'center' }}>
            {balanceVisible ? (
              <View style={{ flexDirection:'row', alignItems:'flex-end' }}>
                <Text style={{ color:'#fff', fontSize:22, letterSpacing: 1, fontFamily: FONT_HEAVY }}>
                  {formatVNCurrency(balance)}
                </Text>
                <Text style={{ color:'#fff', fontSize:13, fontFamily: FONT_REG, marginLeft: BAL_SPACING, marginBottom:10, opacity:0.7 }}>
                  VND
                </Text>
              </View>
            ) : (
              <Text style={{ color:'#fff', fontSize:22, fontFamily: FONT_HEAVY, marginLeft: 0 }}>********</Text>
            )}

            <TouchableOpacity
              onPress={() => setBalanceVisible(v => !v)}
              style={{ marginLeft: eyeGap, padding: 6 }}
              hitSlop={{ top:6, bottom:6, left:6, right:6 }}
              accessibilityRole="button"
              accessibilityLabel={eyeLabel}
            >
              <Ionicons name={balanceVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color="#fff" style={{ opacity: EYE_OPACITY }} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
                navigation.reset({
                  index: 1,
                  routes: [{ name: 'Home' }, { name: 'Transfer' }],
                })
              }
            style={{ position: 'absolute', top: accTop + 60, left: (SW - SW*0.42)/2, width: SW*0.42, height: 337, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#000', fontSize: 14, textAlign: 'center' }}>
              Chuyển tiền{"\n"}trong nước
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Image
        source={BottomOverlay}
        style={{ position:'absolute', left:0, bottom:0, width:SW, height:OVER_H, zIndex:50 }}
        resizeMode="contain"
        pointerEvents="none"
      />
    
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openEdit}
        style={{
          position: 'absolute',
          bottom: 41,
          right: 128,
          zIndex: 51,
          width: 44,
          height: 44,
          borderRadius: 29,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}></Text>
      </TouchableOpacity>

      <Modal visible={showEditModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={modalStyles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={modalStyles.sheet}>
                <Text style={modalStyles.title}>Cài đặt tài khoản</Text>
                <Text style={modalStyles.label}>Họ tên</Text>
                <TextInput value={tmpName} onChangeText={t => setTmpName(t.toUpperCase())} placeholder="Nhập họ tên" style={modalStyles.input} />
                <Text style={modalStyles.label}>Số tài khoản</Text>
                <TextInput value={tmpAcc} onChangeText={t => setTmpAcc(t.replace(/\D/g,''))} placeholder="Nhập số tài khoản" keyboardType="number-pad" style={modalStyles.input} />
                <Text style={modalStyles.label}>Số tiền (VND)</Text>
                <TextInput value={formatVNCurrency(tmpBal)} onChangeText={t => setTmpBal(t.replace(/\D/g,''))} placeholder="Nhập số dư" keyboardType="number-pad" style={modalStyles.input} />
                <View style={modalStyles.row}>
                  <TouchableOpacity style={modalStyles.btnGhost} onPress={() => setShowEditModal(false)}><Text>Hủy</Text></TouchableOpacity>
                  <TouchableOpacity style={modalStyles.btn} onPress={saveBoth}><Text style={{ color:'#fff', fontFamily: FONT_HEAVY }}>Lưu</Text></TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

/* =========================================================
   TRANSFER
========================================================= */
function Transfer({ navigation, username, srcAcc, balance, phone }) {
  const { width: IMG_W, height: IMG_H } = Image.resolveAssetSource(BgTransfer);
  const ratio = IMG_H / IMG_W;
  const H = SW * ratio;
  const vPad = Math.max(0, (SH - H) / 2);
  const bx = (p) => p * SW;
  const by = (p) => vPad + p * H;
  const rightFrom = (x) => SW - bx(x);
  const GAP = 8; // khoảng cách giữa số và VND (px)

  const { width: H_IMG_W, height: H_IMG_H } = Image.resolveAssetSource(HeaderTransfer);
  const HEADER_OVERLAY_HEIGHT = SW * (H_IMG_H / H_IMG_W);
  
  const { width: B_IMG_W, height: B_IMG_H } = Image.resolveAssetSource(BottomContinue);
  const BOTTOM_OVERLAY_WIDTH = SW * 1;
  const BOTTOM_OVERLAY_HEIGHT = BOTTOM_OVERLAY_WIDTH * (B_IMG_H / B_IMG_W);

  const POS = {
    srcAcc:    { x: 0.60, y: 0.135 }, balNumber: { x: 0, y: 0.164 }, balVnd:    { x: 0.78, y: 0.170 },
    bankPh:    { x: 0.080, y: 0.318 }, destAcc:   { x: 0.080, y: 0.393 }, receiver:  { x: 0.080, y: 0.467 },
    amount:    { x: 0.080, y: 0.632 }, note:      { x: 0.080, y: 0.707 }, purposePh: { x: 0.080, y: 0.780 },
    bankLabel: { x: 0.080, y: 0.303 },
    bankLogo:  { x: 0.085, y: 0.303 },
    bankName:  { x: 0.200, y: 0.322 },
  };
  const { PIXEL_OFFSETS, LABEL_SHIFT, NAME_WIDTH_PCT } = TRANSFER_LAYOUT;
  
  const [destAcc, setDestAcc]   = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount]     = useState('');
  const [note, setNote]         = useState(`${username} chuyen tien`);
  const [bankModal, setBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankSelected, setBankSelected] = useState(null);
  const [isPurposeModalVisible, setPurposeModalVisible] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [activeMainCategory, setActiveMainCategory] = useState(SPENDING_CATEGORIES[0].main);

    const BANKS = useMemo(() => ([
        { code: 'ABBANK', name: 'ABBANK', sub: 'Ngân hàng An Bình', logo: require('./assets/logos/ABBANK.png') },
        { code: 'ACB', name: 'ACB', sub: 'Ngân hàng Á Châu', logo: require('./assets/logos/ACB.png') },
        { code: 'AGRIBANK', name: 'AGRIBANK', sub: 'Ngân hàng Nông nghiệp và phát triển nông thôn Việt Nam', logo: require('./assets/logos/AGRIBANK.png') },
        { code: 'ANZ', name: 'ANZ', sub: 'Ngân hàng TNHH Một Thành Viên ANZ Việt Nam', logo: require('./assets/logo.png') },
        { code: 'BAC A BANK', name: 'BAC A BANK', sub: 'Ngân hàng Bắc Á', logo: require('./assets/logos/BACABANK.png') },
        { code: 'BANGKOK BANK', name: 'BANGKOK BANK', sub: 'Ngân hàng Bangkok Bank - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'BANGKOK BANK HN', name: 'BANGKOK BANK', sub: 'Ngân hàng Bangkok Bank - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'BAO VIET BANK', name: 'BAO VIET BANK', sub: 'Ngân hàng Bảo Việt', logo: require('./assets/logos/BAOVIETBANK.png') },
        { code: 'BIDV', name: 'BIDV', sub: 'Ngân hàng Đầu tư và phát triển Việt Nam', logo: require('./assets/logos/BIDV.png') },
        { code: 'BIDC HCM', name: 'BIDC', sub: 'Đầu Tư và Phát Triển Campuchia - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'BIDC HN', name: 'BIDC', sub: 'Đầu Tư và Phát Triển Campuchia - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'BOI', name: 'BOI - BANK OF INDIA', sub: 'Ngân hàng Bank of India', logo: require('./assets/logo.png') },
        { code: 'BSP', name: 'BSP', sub: 'Ngân hàng SINOPAC', logo: require('./assets/logo.png')},
        { code: 'BNP PARIBAS HCM', name: 'BNP PARIBAS HCM', sub: 'Ngân hàng BNP Paribas - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'BNP PARIBAS HN', name: 'BNP PARIBAS HN', sub: 'Ngân hàng BNP Paribas - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'BVBANK', name: 'BVBank', sub: 'Ngân hàng Bản Việt', logo: require('./assets/logos/BVBANK.png') },
        { code: 'BVBANKTIMO', name: 'BVBANK TIMO', sub: 'Ngân hàng số Timo - Ngân hàng TMCP Bản Việt', logo: require('./assets/logos/BVBANKTIMO.png') },
        { code: 'CAKE', name: 'CAKE', sub: 'Ngân hàng CAKE BY VPBANK', logo: require('./assets/logos/CAKE.png') },
        { code: 'VCBNEO', name: 'VCBNeo', sub: 'Ngân hàng TM TNHH Một Thành Viên Ngoại thương Công nghệ số', logo: require('./assets/logos/VCBNEO.png') },
        { code: 'CCB', name: 'CCB', sub: 'Ngân hàng Xây dựng Trung Quốc', logo: require('./assets/logo.png') },
        { code: 'CIMB', name: 'CIMB', sub: 'Ngân hàng TNHH MTV CIMB Việt Nam', logo: require('./assets/logos/CIMB.png') },
        { code: 'CITIBANK HN', name: 'CITIBANK', sub: 'Ngân hàng Citibank Việt Nam - CN Hà Nội', logo: require('./assets/logos/CITYBANK.png') },
        { code: 'CITIBANK', name: 'CITIBANK', sub: 'Ngân hàng Citibank Việt Nam', logo: require('./assets/logos/CITYBANK.png') },
        { code: 'CO-OPBANK', name: 'CO-OPBANK', sub: 'Ngân hàng Hợp tác xã Việt Nam', logo: require('./assets/logo.png') },
        { code: 'CREDIT AGRICOLE', name: 'CREDIT AGRICOLE', sub: 'Ngân hàng Crédit Agricole Corporate and Investment - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'CTBC', name: 'CTBC', sub: 'Ngân hàng TNHH CTBC', logo: require('./assets/logo.png') },
        { code: 'CUB HCM', name: 'CUB HCM', sub: 'Cathay United Bank - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'DBS', name: 'DBS', sub: 'Ngân hàng DBS - CN Hồ Chí Minh', logo: require('./assets/logos/DBS.png') },
        { code: 'DEUTSCHE BANK', name: 'DEUTSCHE BANK', sub: 'Ngân hàng DEUTSCHE BANK', logo: require('./assets/logo.png') },
        { code: 'DGB DAEGU CN HCM', name: 'DGB DAEGU CN HCM', sub: 'Ngân hàng Daegu - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'ESB', name: 'ESB', sub: 'Ngân hàng E.SUN BANK', logo: require('./assets/logo.png') },
        { code: 'EXIMBANK', name: 'EXIMBANK', sub: 'Ngân hàng Xuất Nhập khẩu', logo: require('./assets/logos/EXIMBANK.png') },
        { code: 'FINVIET', name: 'FINVIET', sub: 'Công ty Cổ phần Công nghệ FINVIET', logo: require('./assets/logo.png') },
        { code: 'FIRSTBANK HN', name: 'FIRSTBANK', sub: 'Ngân hàng First Commercial Bank - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'FIRSTBANK HCM', name: 'FIRSTBANK', sub: 'Ngân hàng First Commercial Bank - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'GPBANK', name: 'GPBANK', sub: 'Ngân hàng Dầu khí toàn cầu', logo: require('./assets/logos/GPBANK.png') },
        { code: 'HANOI ABC', name: 'HANOI ABC', sub: 'Ngân hàng Agricultural Bank of China Limited - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'HDBANK', name: 'HD BANK', sub: 'Ngân hàng Phát triển TP.HCM', logo: require('./assets/logos/HDBANK.png') },
        { code: 'HLBVN', name: 'HLBVN', sub: 'Ngân hàng HongLeong Việt Nam', logo: require('./assets/logo.png') },
        { code: 'HSBC', name: 'HSBC', sub: 'Ngân hàng TNHH MTV HSBC Việt Nam', logo: require('./assets/logos/HSBC.png') },
        { code: 'HUA NAN', name: 'HUA NAN', sub: 'Ngân hàng Hua Nam Commercial Bank, Ltd - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'IBK BANK HN', name: 'IBK BANK HN', sub: 'Ngân hàng Công nghiệp Hàn Quốc - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'IBK HCM', name: 'IBK HCM', sub: 'Ngân hàng Công nghiệp Hàn Quốc - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'ICBC', name: 'ICBC', sub: 'Ngân hàng Công Thương Trung Quốc', logo: require('./assets/logo.png') },
        { code: 'IVB', name: 'IVB', sub: 'Ngân hàng TNHH Indovina', logo: require('./assets/logos/IVB.png') },
        { code: 'J.P.MORGAN', name: 'J.P.MORGAN', sub: 'Ngân hàng JPMorgan Chase, N.A.', logo: require('./assets/logo.png') },
        { code: 'KB HCM', name: 'KB HCM', sub: 'Ngân hàng Kookmin - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'KB HN', name: 'KB HN', sub: 'Ngân hàng Kookmin - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'KBANK', name: 'KBANK', sub: 'Ngân hàng đại chúng TNHH KASIKORNBANK - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'KEB HANA HN', name: 'KEB HANA', sub: 'Ngân hàng KEB HANA - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'KEB HANA HCM', name: 'KEB HANA', sub: 'Ngân hàng KEB HANA - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'KIEN LONG BANK', name: 'KIEN LONG BANK', sub: 'Ngân hàng Kiên Long', logo: require('./assets/logo.png') },
        { code: 'LPBank', name: 'LPBank', sub: 'Ngân hàng TMCP Lộc Phát Việt Nam', logo: require('./assets/logos/LPBANK.png') },
        { code: 'LIOBANK', name: 'LIOBANK', sub: 'Ngân hàng số Liobank - Ngân hàng TMCP Phương Đông', logo: require('./assets/logos/LIOBANK.png') },
        { code: 'MAFC', name: 'MAFC', sub: 'Công ty Tài chính TNHH MTV Mirae Asset Việt Nam', logo: require('./assets/logo.png') },
        { code: 'MB', name: 'MB', sub: 'Ngân hàng Quân Đội', logo: require('./assets/logos/MB.png') },
        { code: 'Maybank Hanoi', name: 'Maybank Hanoi', sub: 'Ngân hàng Malayan Banking Berhad - CN Hà Nội', logo: require('./assets/logo.png') },
        { code: 'Maybank HCMC', name: 'Maybank HCMC', sub: 'Ngân hàng Malayan Banking Berhad TP. Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'MEGA ICBC', name: 'MEGA ICBC', sub: 'Ngân hàng Mega International Commercial Bank Co., Ltd - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'MIZUHO HN', name: 'MIZUHO', sub: 'Ngân hàng Mizuho Bank, LTD - Chi nhánh Hà Nội', logo: require('./assets/logo.png') },
        { code: 'MIZUHO', name: 'MIZUHO', sub: 'Ngân hàng Mizuho Bank, Ltd', logo: require('./assets/logo.png') },
        { code: 'MSB', name: 'MSB', sub: 'Ngân hàng Hàng Hải', logo: require('./assets/logos/MSB.png') },
        { code: 'MUFG HCM', name: 'MUFG', sub: 'Ngân hàng MUFG Bank. Ltd - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'MUFG HN', name: 'MUFG', sub: 'Ngân hàng MUFG Bank. Ltd – Chi Nhánh Hà Nội', logo: require('./assets/logo.png') },
        { code: 'NAM A BANK', name: 'NAM A BANK', sub: 'Ngân hàng Nam Á', logo: require('./assets/logos/NAMABANK.png') },
        { code: 'NAPAS', name: 'NAPAS', sub: 'Công ty Cổ phần Thanh toán Quốc gia Việt Nam', logo: require('./assets/logo.png') },
        { code: 'NCB', name: 'NCB', sub: 'Ngân hàng Quốc Dân', logo: require('./assets/logos/NCB.png') },
        { code: 'NONGHYUP', name: 'NONGHYUP', sub: 'Ngân hàng Nonghyup - Chi nhánh Hà Nội', logo: require('./assets/logo.png') },
        { code: 'OCB', name: 'OCB', sub: 'Ngân hàng Phương Đông', logo: require('./assets/logos/OCB.png') },
        { code: 'OCBC', name: 'OCBC', sub: 'Ngân hàng Oversea-Chinese Banking Corporation LTD - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'PAYOO', name: 'PAYOO', sub: 'Công ty Cổ phần Dịch vụ Trực tuyến Cộng Đồng Việt', logo: require('./assets/logo.png') },
        { code: 'PGBANK', name: 'PGBANK', sub: 'Ngân hàng TMCP Thịnh vượng và Phát triển (PGBANK)', logo: require('./assets/logos/PGBANK.png') },
        { code: 'PVCOMBANK', name: 'PVCOMBANK', sub: 'Ngân hàng Đại chúng', logo: require('./assets/logos/PVCOMBANK.png') },
        { code: 'SACOMBANK', name: 'SACOMBANK', sub: 'Ngân hàng Sài Gòn thương tín', logo: require('./assets/logos/STB.png') },
        { code: 'SAIGONBANK', name: 'SAIGONBANK', sub: 'Ngân hàng Sài Gòn Công Thương', logo: require('./assets/logos/SAIGONBANK.png') },
        { code: 'SCB', name: 'SCB', sub: 'Ngân hàng Sài Gòn', logo: require('./assets/logos/SCB.png') },
        { code: 'SCB The Siam', name: 'SCB', sub: 'Ngân hàng The Siam Commercial Bank Public Company Limited - CN TP Hồ Chí Minh', logo: require('./assets/logo.png') },
        { code: 'SCVN', name: 'SCVN', sub: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', logo: require('./assets/logo.png') },
        { code: 'SEABANK', name: 'SEABANK', sub: 'Ngân hàng Đông Nam Á', logo: require('./assets/logos/SEABANK.png') },
        { code: 'SHB', name: 'SHB', sub: 'Ngân hàng Sài Gòn Hà Nội', logo: require('./assets/logos/SHB.png') },
        { code: 'SHINHAN', name: 'SHINHAN', sub: 'Ngân hàng Shinhan Bank Việt Nam', logo: require('./assets/logos/SHINHAN.png') },
        { code: 'SHOPEEPAY', name: 'ShopeePay', sub: 'Công ty Cổ phần ShopeePay', logo: require('./assets/logo.png') },
        { code: 'SVFC', name: 'SVFC', sub: 'Công ty Tài chính TNHH MTV Shinhan Việt Nam', logo: require('./assets/logo.png') },
        { code: 'TAIPEI FUBON', name: 'TAIPEI FUBON', sub: 'Ngân hàng TAIPEI FUBON', logo: require('./assets/logo.png') },
        { code: 'TECHCOMBANK', name: 'TECHCOMBANK', sub: 'Ngân hàng Kỹ thương Việt Nam', logo: require('./assets/logos/TECHCOMBANK.png') },
        { code: 'TPBANK', name: 'TPBANK', sub: 'Ngân hàng Tiên phong', logo: require('./assets/logos/TPBANK.png') },
        { code: 'UBANK', name: 'UBANK', sub: 'Ngân hàng UBANK BY VPBANK', logo: require('./assets/logo.png') },
        { code: 'UMEE', name: 'UMEE', sub: 'Ngân hàng số UMEE by Kienlongbank', logo: require('./assets/logo.png') },
        { code: 'UOB Vietnam', name: 'UOB Vietnam', sub: 'Ngân hàng TNHH MTV UOB Việt Nam', logo: require('./assets/logo.png') },
        { code: 'VBSP', name: 'VBSP', sub: 'Ngân hàng Chính sách xã hội VBSP', logo: require('./assets/logos/VBSP.png') },
        { code: 'VDB', name: 'VDB', sub: 'Ngân hàng Phát triển Việt Nam', logo: require('./assets/logo.png') },
        { code: 'VIB', name: 'VIB', sub: 'Ngân hàng Quốc tế', logo: require('./assets/logos/VIB.png') },
        { code: 'VIET A BANK', name: 'VIET A BANK', sub: 'Ngân hàng Việt Á', logo: require('./assets/logos/VIETABANK.png') },
        { code: 'VIETBANK', name: 'VIETBANK', sub: 'Ngân hàng Việt Nam Thương Tín', logo: require('./assets/logos/VIETBANK.png') },
        { code: 'VIETINBANK', name: 'VIETINBANK', sub: 'Ngân hàng Công Thương Việt Nam', logo: require('./assets/logos/VIETINBANK.png') },
        { code: 'VIETTEL MONEY', name: 'VIETTEL MONEY', sub: 'Viettel Money', logo: require('./assets/logos/VIETTELMONEY.png') },
        { code: 'Vikki Bank', name: 'Vikki Bank', sub: 'Ngân hàng Trách nhiệm hữu hạn Một thành viên số Vikki', logo: require('./assets/logo.png') },
        { code: 'Vikki by HDBank', name: 'Vikki by HDBank', sub: 'Kênh số hóa Vikki – trực thuộc HDBank', logo: require('./assets/logo.png') },
        { code: 'VNPT MONEY', name: 'VNPT MONEY', sub: 'VNPT Money', logo: require('./assets/logos/VNPTMONEY.png') },
        { code: 'VPBANK', name: 'VPBANK', sub: 'Ngân hàng Việt Nam Thịnh Vượng', logo: require('./assets/logos/VPBANK.png') },
        { code: 'Woori Bank', name: 'Woori Bank', sub: 'Ngân hàng Woori Việt Nam', logo: require('./assets/logo.png') },
        { code: 'ZION', name: 'Công ty cổ phần Zion', sub: 'Công ty cổ phần Zion', logo: require('./assets/logo.png') },
    ]), []);

  const filteredBanks = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return BANKS;
    return BANKS.filter(b => b.name.toLowerCase().includes(q) || (b.sub || '').toLowerCase().includes(q) || b.code.toLowerCase().includes(q) );
  }, [BANKS, bankSearch]);
  
  const currentSubCategories = useMemo(() => {
    return SPENDING_CATEGORIES.find(cat => cat.main === activeMainCategory)?.sub || [];
  }, [activeMainCategory]);

  const placeholderTextColor = '#9aa1a6';

  const handleContinue = () => {
    if (!destAcc || !amount || !bankSelected || !receiver) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin người nhận, ngân hàng và số tiền.");
      return;
    }
    const details = {
      srcAcc: srcAcc,
      destAcc: destAcc,
      receiver: receiver,
      amount: amount,
      note: note,
      bank: bankSelected,
      fee: 0,
      phone: phone,
      balance: balance,
      username: username,
    };
    navigation.navigate('Confirm', { details });
  };


  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:'#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <Image
        source={HeaderTransfer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SW,
          height: HEADER_OVERLAY_HEIGHT,
          zIndex: 10,
        }}
        resizeMode="contain"
        pointerEvents="none"
      />
      <TouchableOpacity
        style={headerButtonStyles.backButton}
        onPress={() => navigation.goBack()}
      />
      <TouchableOpacity
        style={headerButtonStyles.homeButton}
        onPress={() =>
  navigation.reset({
    index: 1,
    routes: [
      { name: 'Login2' },
      { name: 'Home' }
    ],
  })
}
      />

      <ScrollView bounces={false} alwaysBounceVertical={false} overScrollMode="never" showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ width: SW, height: H }}>
          <ImageBackground source={BgTransfer} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
          <Text style={[overlayStyles.srcAcc, { left: bx(POS.srcAcc.x), top: by(POS.srcAcc.y) }]}>{srcAcc}</Text>
          {/* ===== SỐ DƯ (nở sang trái) ===== */}
          <View
            style={{
              position: 'absolute',
              top: by(POS.balNumber.y),
              left: bx(POS.balNumber.x),
              width: SW * (POS.balVnd.x - POS.balNumber.x) - GAP, // tới sát trước VND
              alignItems: 'flex-end', // canh phải cho nội dung bên trong
            }}
          >
            <Text
              style={{
                // KHÔNG dùng overlayStyles.balNumber vì style đó có position:'absolute'
                color: '#fff',
                fontFamily: FONT_HEAVY,
                fontSize: 22,
                letterSpacing: 1,
                textAlign: 'right',
              }}
              numberOfLines={1}
            >
              {formatVNCurrency(balance)}
            </Text>
          </View>

          {/* ===== VND (dịch riêng bằng POS.balVnd) ===== */}
          <Text
            style={[
              overlayStyles.balVnd, // style này đã absolute sẵn
              { left: bx(POS.balVnd.x), top: by(POS.balVnd.y) }
            ]}
          >
            VND
          </Text>
          
          {!bankSelected ? (
            <>
              <Text style={{ position: 'absolute', left: bx(POS.bankLabel.x), top: by(POS.bankLabel.y) - 6, color: 'black', fontFamily: FONT_MEDIUM, fontSize: 13, opacity: 0.7 }}>Ngân hàng nhận</Text>
              <Text style={[ overlayStyles.placeholder, { position: 'absolute', left: bx(POS.bankPh.x), top: by(POS.bankPh.y) } ]}>Chọn ngân hàng nhận</Text>
            </>
          ) : (
            <>
              <Text style={{ position: 'absolute', left: bx(POS.bankLabel.x) + 49, top: by(POS.bankLabel.y) - 4, color: 'black', fontFamily: FONT_MEDIUM, fontSize: 13, opacity: 0.8 }}>Ngân hàng nhận</Text>
              <View style={{ position: 'absolute', left: bx(POS.bankLogo.x) - 3 + PIXEL_OFFSETS.bankLogo.x, top: by(POS.bankLogo.y) - 1 + PIXEL_OFFSETS.bankLogo.y }}><BankLogo localSource={bankSelected.logo} size={35} /></View>
              <Text style={[ overlayStyles.bankChosenText, { position: 'absolute', left: bx(POS.bankName.x) + 2 + PIXEL_OFFSETS.bankName.x, top: by(POS.bankName.y) - 2 + PIXEL_OFFSETS.bankName.y, width: SW * NAME_WIDTH_PCT } ]} numberOfLines={1} ellipsizeMode="tail">{`${bankSelected.name} - ${bankSelected.sub}`}</Text>
            </>
          )}

          <TextInput value={destAcc} onChangeText={(t) => setDestAcc(t.replace(/\s/g,''))} placeholder="Chọn hoặc nhập số tài khoản/số thẻ..." placeholderTextColor={placeholderTextColor} keyboardType="number-pad" style={[overlayStyles.editableInput, { left: bx(POS.destAcc.x), top: by(POS.destAcc.y), width: SW*0.78 }]}/>
          <TextInput value={receiver} onChangeText={(text) => setReceiver(capitalizeWords(text))} placeholder="Nhập tên người nhận" placeholderTextColor={placeholderTextColor} style={[overlayStyles.editableInput, { left: bx(POS.receiver.x), top: by(POS.receiver.y), width: SW*0.78 }]}/>
          {/* Sửa lỗi UI: Thêm adjustsFontSizeToFit để số tiền không bị tràn */}
          <TextInput
            value={amount ? formatVNCurrency(amount) : ''}
            onChangeText={(t) => setAmount(t.replace(/\D/g,''))}
            placeholder="Nhập số tiền"
            placeholderTextColor={placeholderTextColor}
            keyboardType="number-pad"
            style={[overlayStyles.editableInput, { left: bx(POS.amount.x), top: by(POS.amount.y), width: SW*0.46 }]}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            minimumFontScale={0.7}
          />
          <TextInput value={note} onChangeText={setNote} placeholder="Nhập nội dung chuyển khoản" placeholderTextColor={placeholderTextColor} style={[overlayStyles.editableInput, { left: bx(POS.note.x), top: by(POS.note.y), width: SW*0.78 }]}/>
          {selectedPurpose ? (<Text style={[overlayStyles.editableInput, {left: bx(POS.purposePh.x), top: by(POS.purposePh.y)}]}>{selectedPurpose}</Text>) : (<Text style={[overlayStyles.placeholder, {left: bx(POS.purposePh.x), top: by(POS.purposePh.y), position:'absolute'}]}>Chọn giao dịch theo mục đích</Text>)}
          <TouchableOpacity activeOpacity={0.8} onPress={() => setBankModal(true)} style={{ position:'absolute', left: bx(0.075), top: by(0.295), width: SW*0.85, height: 54 }}/>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setPurposeModalVisible(true)} style={{ position: 'absolute', left: bx(0.075), top: by(0.780 - 0.023), width: SW * 0.85, height: 54 }}/>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleContinue}
        style={{
          position: 'absolute',
          bottom: 1,
          alignSelf: 'center',
          width: BOTTOM_OVERLAY_WIDTH,
          height: BOTTOM_OVERLAY_HEIGHT,
        }}
      >
        <Image
            source={BottomContinue}
            style={{
                width: '100%',
                height: '100%',
            }}
            resizeMode="contain"
        />
      </TouchableOpacity>
      
      <Modal visible={bankModal} transparent animationType="slide" onRequestClose={()=>setBankModal(false)}>
        <View style={bankStyles.backdrop}>
          <View style={bankStyles.sheet}>
            <View style={bankStyles.header}>
              <Text style={bankStyles.title}>Chọn ngân hàng</Text>
              <TouchableOpacity onPress={()=>setBankModal(false)} style={bankStyles.closeBtn}><Text style={{ fontSize:18 }}>✕</Text></TouchableOpacity>
            </View>
            <View style={bankStyles.searchRow}>
              <Text style={{ fontSize:16, marginRight:6, color:'#777' }}>🔎</Text>
              <TextInput value={bankSearch} onChangeText={setBankSearch} placeholder="Nhập tên ngân hàng" placeholderTextColor="#9aa1a6" style={bankStyles.searchInput}/>
            </View>
            
            <FlatList
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              data={filteredBanks}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={bankStyles.item} onPress={() => { setBankSelected(item); setBankModal(false); }}>
                  <View style={{ marginRight: 12 }}>
                    <BankLogo localSource={item.logo} size={36} />
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={bankStyles.itemName}>{item.name}</Text>
                    {!!item.sub && <Text style={bankStyles.itemSub}>{item.sub}</Text>}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height:1, backgroundColor:'#eee' }} />}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={() => (
                <View style={{ flex:1, paddingTop: 40, alignItems:'center' }}>
                  <Text style={{ color:'#9aa1a6', fontFamily: FONT_REG, fontSize: 16 }}>
                    Không có kết quả phù hợp với thông tin tìm kiếm
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={isPurposeModalVisible} transparent animationType="slide" onRequestClose={() => setPurposeModalVisible(false)}>
        <View style={purposeModalStyles.backdrop}>
          <View style={purposeModalStyles.sheet}>
            <View style={purposeModalStyles.header}><Text style={purposeModalStyles.title}>Chọn danh mục chi</Text><TouchableOpacity onPress={() => setPurposeModalVisible(false)} style={purposeModalStyles.closeButton}><Text style={{ fontSize: 20, color: '#555' }}>✕</Text></TouchableOpacity></View>
            <View style={{ height: 50, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={purposeModalStyles.mainCategoryContainer}>
                {SPENDING_CATEGORIES.map((cat) => (<TouchableOpacity key={cat.main} style={[purposeModalStyles.mainCategoryTab, activeMainCategory === cat.main && purposeModalStyles.mainCategoryTabActive]} onPress={() => setActiveMainCategory(cat.main)}><Text style={[purposeModalStyles.mainCategoryText, activeMainCategory === cat.main && purposeModalStyles.mainCategoryTextActive]}>{cat.main}</Text></TouchableOpacity>))}
              </ScrollView>
            </View>
            <FlatList
              data={currentSubCategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={purposeModalStyles.subCategoryItem} onPress={() => { setSelectedPurpose(item); setPurposeModalVisible(false); }}>
                  <Text style={purposeModalStyles.subCategoryText}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={purposeModalStyles.separator} />}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const pad2 = (n) => String(n).padStart(2, '0');
const getVNWeekday = (d) => ([
  'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
])[d.getDay()];

const fmtVNDateTime = (d = new Date()) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())} ${getVNWeekday(d)} ${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}`;

/* =========================================================
   CONFIRM
========================================================= */
function Confirm({ route, navigation }) {
    const { width: IMG_W, height: IMG_H } = Image.resolveAssetSource(BgConfirm);
    const ratio = IMG_H / IMG_W;
    const H = SW * ratio;
    const by = (p) => p * H;
    const { details } = route.params;
 
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const otpInputs = useRef([]);

    const { width: HC_IMG_W, height: HC_IMG_H } = Image.resolveAssetSource(HeaderConfirm);
    const HEADER_CONFIRM_HEIGHT = SW * (HC_IMG_H / HC_IMG_W);
    const { width: BC_IMG_W, height: BC_IMG_H } = Image.resolveAssetSource(BottomConfirm);
    const BOTTOM_CONFIRM_HEIGHT = SW * (BC_IMG_H / BC_IMG_W);

    const docso = (n) => {
        const s = n.toString();
        const t = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const r = (i) => t[i];
        const m = (i) => r(Math.floor(i/10)) + " mươi" + (i % 10 !== 0 ? " " + r(i % 10) : "");
        const tr = (i) => r(Math.floor(i / 100)) + " trăm" + (i % 100 !== 0 ? " " + (i % 100 < 10 ? "linh " + r(i % 100) : m(i % 100)) : "");
        let result = "";
        let len = s.length;
        if (len === 0) return "";
        let i = 0;
        let suffix = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
        while (i < len) {
            let chunk = s.substring(Math.max(0, len - (i + 3)), len - i);
            if (chunk !== "000") {
                let j = chunk.length;
                let c = parseInt(chunk);
                let text = "";
                if (j === 1) text = r(c);
                else if (j === 2) text = c < 20 ? (c === 10 ? "mười" : "mười " + r(c % 10)) : m(c);
                else if (j === 3) text = tr(c);
                result = text + suffix[i / 3] + (result ? " " + result : "");
            }
            i += 3;
        }
        if (!result) return "Không đồng";
        return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
    };

    // ===== SỬA ĐỔI TẠI ĐÂY =====
    const formatNote = (note) => {
      if (!note) return '';
      const words = note.split(' ');
  
      const part1 = words.slice(0, 4).join(' ');
      const part2 = words.slice(4, 9).join(' ');
      const part3 = words.slice(9).join(' ');
  
      // Lọc ra các phần có nội dung và nối chúng bằng ký tự xuống dòng
      const parts = [part1, part2, part3].filter(part => part);
      return parts.join('\n');
    };
    
    const handleOtpChange = (text) => {
        setOtp(text);
    };

    const handleConfirmOtp = () => {
        if (otp.length === 6) {
            setOtpModalVisible(false);
            navigation.navigate('Success', { details });
        }
    };
    
    const maskPhoneNumber = (phone) => {
        if (!phone || phone.length < 10) return phone;
        return `${phone.substring(0, 3)}*****${phone.slice(-2)}`;
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
        <StatusBar barStyle="dark-content" />

             <TouchableOpacity
               style={headerButtonStyles.homeButton}
               onPress={() =>
  navigation.reset({
    index: 1,
    routes: [
      { name: 'Login2' },
      { name: 'Home' }
    ],
  })
}
               accessibilityRole="button"
               accessibilityLabel="Về trang chủ"
             />

        <TouchableOpacity
          style={headerButtonStyles.backButton}
          onPress={() => navigation.goBack()}
        />
        <TouchableOpacity
          style={headerButtonStyles.homeButton}
          onPress={() =>
  navigation.reset({
    index: 1,
    routes: [
      { name: 'Login2' },
      { name: 'Home' }
    ],
  })
}
        />

        <ImageBackground source={BgConfirm} style={{ width: SW, height: H }} resizeMode="contain">
          {/* Định nghĩa vị trí từng dòng */}
          {/*
            Có thể chỉnh riêng từng dòng bằng cách thay đổi top/left/right trong POS.
            - top: dịch lên/xuống (dùng by(...) để theo tỉ lệ ảnh nền).
            - left/right: dịch trái/phải (dùng bx(...) hoặc số px).
          */}
          {(() => {
            const POS = {
              method:   { top: 0.219, align: 'right' }, // Chuyển tiền nhanh 24/7
              srcAcc:   { top: 0.296, align: 'right' }, // Tài khoản nguồn
              destAcc:  { top: 0.349, align: 'right' }, // Tài khoản nhận
              receiver: { top: 0.402, align: 'right' }, // Tên người nhận
              bankCode:  { top: 0.455, align: 'right' }, // Tên ngân hàng
              bankSub:   { top: 0.489, align: 'right' }, // Mô tả ngân hàng
              note:     { top: 0.533, align: 'right' }, // Nội dung
              fee:      { top: 0.636, align: 'right' }, // Phí
              amountNum:{ top: 0.704, align: 'right' }, // Số tiền
              amountVnd:{ top: 0.704, align: 'right' }, // Chữ VND
              amountTxt:{ top: 0.737, align: 'right' }, // Số tiền bằng chữ
            };
            return (
              <>
                {/* Hình thức chuyển */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.method.top), right: 35, left: 35 }]}>
                  <Text style={[confirmStyles.value, { textAlign: POS.method.align }, { fontFamily: FONT_BOLD }]}>
                    {'Chuyển tiền nhanh\n24/7'}
                  </Text>
                </View>

                {/* Tài khoản nguồn */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.srcAcc.top), right: 35, left: 35 }]}>
                  <Text style={[confirmStyles.value, { fontFamily: FONT_BOLD }]}>
                    {details.srcAcc}
                  </Text>
                </View>

                {/* Tài khoản nhận */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.destAcc.top), right: 35, left: 35 }]}>
                  <Text style={[confirmStyles.value, { fontFamily: FONT_BOLD }]}>
                    {details.destAcc}
                  </Text>
                </View>

                {/* Tên người nhận */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.receiver.top), right: 35, left: 35 }]}>
                  <Text style={[confirmStyles.value, confirmStyles.receiverRed, { fontFamily: FONT_BOLD, color: '#f30808'}]}>
                    {details.receiver?.toUpperCase()}
                  </Text>
                </View>

                {/* Ngân hàng nhận */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.bankCode.top), right: 35, left: 35 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <BankLogo localSource={details.bank.logo} size={24} />
                    <Text style={[confirmStyles.value, { marginLeft: 8, fontFamily: FONT_BOLD }]}>
                      {details.bank.code}
                    </Text>
                  </View>
                </View>

                {/* Ngân hàng nhận */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.bankSub.top), right: 35, left: 35 }]}>
                  <Text style={[
                    confirmStyles.value,
                    { fontSize: 12.1, color: '#1f1f1f', fontFamily: FONT_MEDIUM }
                  ]}>
                    {details.bank.sub}
                  </Text>
                </View>

                {/* Nội dung */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.note.top), right: 35, left: 35 }]}>
                  <Text style={[confirmStyles.value, { textAlign: POS.note.align, fontFamily: FONT_BOLD }]}>{formatNote(details.note)}</Text>
                </View>

                {/* Phí */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.fee.top), right: 35, left: 35 }]}>
                  <Text style={[confirmStyles.value, { fontFamily: FONT_BOLD }]}>
                    {details.fee === 0 ? 'Miễn phí' : `${formatVNCurrency(details.fee)} VND`}
                  </Text>
                </View>

                {/* Số tiền */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.amountNum.top), right: 66 }]}>
                  <Text style={[confirmStyles.value, confirmStyles.amountRed, { fontFamily: FONT_HEAVY, fontSize: 20, color: '#ff3a2c'}]}>
                    {formatVNCurrency(details.amount)}
                  </Text>
                </View>

                {/* VND */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.amountVnd.top), right: 35 }]}>
                  <Text style={[confirmStyles.value, confirmStyles.subAmountRed, { fontSize: 14, color: '#f30808'}]}>
                    VND
                  </Text>
                </View>

                {/* Số tiền bằng chữ */}
                <View style={[confirmStyles.valueContainer, { top: by(POS.amountTxt.top), right: 35 }]}>
                  <Text style={[confirmStyles.value, confirmStyles.subAmountRed, { fontSize: 14, fontStyle: 'italic', textAlign: 'right', color: '#f30808' }]}>
                    ({docso(details.amount)})
                  </Text>
                </View>
              </>
            );
          })()}
        </ImageBackground>

        <Image
            source={HeaderConfirm}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: SW,
                height: HEADER_CONFIRM_HEIGHT,
                zIndex: 10,
            }}
            resizeMode="contain"
            pointerEvents="none"
        />

        <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => setOtpModalVisible(true)}
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: SW,
                height: BOTTOM_CONFIRM_HEIGHT,
                zIndex: 10,
            }}
        >
            <Image
                source={BottomConfirm}
                style={{ width: '100%', height: '100%'}}
                resizeMode="contain"
            />
        </TouchableOpacity>

        <Modal
            visible={otpModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setOtpModalVisible(false)}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={otpStyles.backdrop}>
                <View style={otpStyles.modalView}>
                    <TouchableOpacity style={otpStyles.closeButton} onPress={() => setOtpModalVisible(false)}>
                        <Text style={{fontSize: 24, color: '#888'}}>×</Text>
                    </TouchableOpacity>

                    <View style={otpStyles.iconContainer}>
                        <Text style={{fontSize: 20}}>ℹ️</Text>
                    </View>
                    
                    <Text style={otpStyles.title}>Xác thực giao dịch</Text>
                    <Text style={otpStyles.subtitle}>
                        Quý khách vui lòng nhập mã OTP đã được gửi về số điện thoại {maskPhoneNumber(details.phone)}
                    </Text>

                    <View style={otpStyles.otpContainer}>
                        {Array(6).fill(0).map((_, index) => (
                            <View key={index} style={[otpStyles.otpBox, otp.length === index && otpStyles.otpBoxFocused]}>
                                <Text style={otpStyles.otpText}>{otp[index] || ''}</Text>
                            </View>
                        ))}
                    </View>
                    
                    <TextInput
                        style={otpStyles.hiddenInput}
                        keyboardType="number-pad"
                        maxLength={6}
                        onChangeText={handleOtpChange}
                        autoFocus={true}
                    />

                    <TouchableOpacity 
                        style={[otpStyles.confirmButton, otp.length !== 6 && otpStyles.confirmButtonDisabled]}
                        disabled={otp.length !== 6}
                        onPress={handleConfirmOtp}
                    >
                         <LinearGradient
                            colors={['#56ab2f', '#00642B']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <Text style={otpStyles.confirmButtonText}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
      </View>
    );
}

/* =========================================================
   SUCCESS (bản cấu trúc giống CONFIRM để dễ chỉnh)
========================================================= */
function Success({ route, navigation }) {
  const { details } = route.params;
  // ===== SỬA ĐỔI TẠI ĐÂY (Đồng bộ với màn hình Confirm) =====
  const formatNote = (note) => {
    if (!note) return '';
    const words = note.split(' ');

    const part1 = words.slice(0, 4).join(' ');
    const part2 = words.slice(4, 9).join(' ');
    const part3 = words.slice(9).join(' ');

    // Lọc ra các phần có nội dung và nối chúng bằng ký tự xuống dòng
    const parts = [part1, part2, part3].filter(part => part);
    return parts.join('\n');
  };

  // Kích thước nền theo tỉ lệ ảnh
  const { width: IMG_W, height: IMG_H } = Image.resolveAssetSource(BgSuccess);
  const ratio = IMG_H / IMG_W;
  const H = SW * ratio;
  const by = (p) => p * H;

  // Đổi số thành chữ (dùng lại logic ở Confirm)
  const docso = (n) => {
    const s = String(n);
    const t = ["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];
    const r = (i) => t[i];
    const m = (i) => r(Math.floor(i/10)) + " mươi" + (i % 10 !== 0 ? " " + r(i % 10) : "");
    const tr = (i) => r(Math.floor(i/100)) + " trăm" + (i % 100 !== 0 ? " " + (i % 100 < 10 ? "linh " + r(i % 100) : m(i % 100)) : "");
    let result = "", len = s.length, i = 0;
    const suffix = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
    while (i < len) {
      const chunk = s.substring(Math.max(0, len - (i + 3)), len - i);
      if (chunk !== "000") {
        const j = chunk.length, c = parseInt(chunk, 10);
        let text = "";
        if (j === 1) text = r(c);
        else if (j === 2) text = c < 20 ? (c === 10 ? "mười" : "mười " + r(c % 10)) : m(c);
        else if (j === 3) text = tr(c);
        result = text + suffix[i / 3] + (result ? " " + result : "");
      }
      i += 3;
    }
    if (!result) return "Không đồng";
    return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  };

  // Mã giao dịch + thời gian hiển thị
  const transactionId = useMemo(() => {
    const randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `108${randomPart}`;
  }, []);
  const now = new Date();
  const pad = (n) => String(n).padStart(2,'0');
  const timeText = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;

  // Thông báo thật (giữ nguyên flow bạn đang dùng)
  useEffect(() => {
    (async () => {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const amountNum = Number(String(details.amount).replace(/\D/g,''));
      const newBalance = details.balance - amountNum;
      const sourceBankCode = 'VCB';
      const ts = `${pad(now.getDate())}-${pad(now.getMonth()+1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const randomRefPart = Math.floor(Math.random()*1000000).toString().padStart(6,'0');
      const notificationRef = `Ref ${details.bank.code}${sourceBankCode}.${transactionId}.${randomRefPart}.${details.username.replace(/ /g,'')}`;
      const body = `Số dư TK ${sourceBankCode} ${details.srcAcc} -${formatVNCurrency(amountNum)} VND lúc ${ts}. Số dư ${formatVNCurrency(newBalance)} VND. ${notificationRef}`;

      await Notifications.scheduleNotificationAsync({
        content: { title: 'Thông báo VCB', body, sound: 'default' },
        trigger: { seconds: 1 },
      });
    })();
  }, []);

  // Layout theo kiểu POS giống Confirm để dễ gõ lại
  const POS = {
    // Bạn chỉ việc đổi các con số top (%) dưới đây
    // cho đúng hình success của bạn
    amountNum: { top: 0.216, align: 'right' },  // Số tiền (đỏ)
    amountVnd: { top: 0.206, align: 'right' },  // VND (đỏ)
    time:      { top: 0.258, align: 'center'},  // Giờ giao dịch
    destAcc:   { top: 0.312, align: 'right' },  // Tài khoản nhận
    receiver:  { top: 0.363, align: 'right' },  // Người nhận
    bankCode:  { top: 0.415, align: 'right' },  // Tên ngân hàng
    bankSub:   { top: 0.443, align: 'right' },  // Mô tả ngân hàng
    note:      { top: 0.476, align: 'right' },  // Nội dung
    fee:       { top: 0.568, align: 'right' },  // Phí
    method:    { top: 0.619, align: 'right' },  // Chuyển tiền nhanh 24/7
    transId:   { top: 0.682, align: 'right' },  // Mã giao dịch
  };

  // Kích thước bottom overlay
  const { width: BO_IMG_W, height: BO_IMG_H } = Image.resolveAssetSource(BottomOverlaySuccess);
  const BOTTOM_OVERLAY_SUCCESS_HEIGHT = SW * (BO_IMG_H / BO_IMG_W);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      {/* Nút back & home trên header (giống Confirm) */}
      <TouchableOpacity
        style={headerButtonStyles.backButton}
        onPress={() => navigation.goBack()}
      />
      <TouchableOpacity
        style={headerButtonStyles.homeButton}
        onPress={() =>
          navigation.reset({
            index: 1,
            routes: [{ name: 'Login2' }, { name: 'Home' }],
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Về trang chủ"
      />

      {/* Phần nội dung chính (giống Confirm: ImageBackground + POS) */}
      <ScrollView
  bounces={false}
  alwaysBounceVertical={false}
  overScrollMode="never"
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ minHeight: H, paddingBottom: BOTTOM_OVERLAY_SUCCESS_HEIGHT + 16 }}
>
<ImageBackground source={BgSuccess} style={{ width: SW, minHeight: H }} resizeMode="contain">
        {/* Container chung cho Số tiền + VND để căn giữa */}
        <View style={{
            position: 'absolute',
            top: by(POS.amountNum.top),
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'baseline',
        }}>
            {/* Số tiền (không đổi) */}
            <Text style={{
                fontFamily: FONT_HEAVY,
                fontSize: 29,
                color: '#0b4b31',
            }}>
                {formatVNCurrency(details.amount)}
            </Text>
            {/* Chữ VND */}
            <Text style={{
                fontSize: 14,
                color: '#698f81',
                fontFamily: FONT_MEDIUM,
                marginLeft: 4,
                // THÊM DÒNG NÀY ĐỂ DỊCH CHUYỂN CHỮ LÊN TRÊN
                transform: [{ translateY: -15 }]
            }}>
                VND
            </Text>
        </View>
        
        {/* Giờ giao dịch */}
        <View style={[
          confirmStyles.valueContainer,
          { top: by(POS.time.top), left: 35, right: 35, alignItems: 'center' } // override
        ]}>
          <Text style={[successStyles.timestampText, { fontFamily: FONT_MEDIUM }]}>
            {fmtVNDateTime(new Date())}
          </Text>
        </View>

        {/* Tài khoản nhận */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.destAcc.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, { fontFamily: FONT_BOLD }]}>{details.destAcc}</Text>
        </View>

        {/* Người nhận (đỏ) */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.receiver.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, confirmStyles.receiverRed, { fontFamily: FONT_BOLD }]}>
            {details.receiver?.toUpperCase()}
          </Text>
        </View>

        {/* Ngân hàng nhận */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.bankCode.top), right: 32, left: 35 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
            <BankLogo localSource={details.bank.logo} size={24} />
            <Text style={[confirmStyles.value, { marginLeft: 8, fontFamily: FONT_BOLD }]}>{details.bank.code}</Text>
          </View>
        </View>

        {/* Mô tả ngân hàng */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.bankSub.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, { fontSize: 12.1, color: '#1f1f1f', fontFamily: FONT_MEDIUM }]}>{details.bank.sub}</Text>
        </View>

        {/* Nội dung chuyển */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.note.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, { textAlign: 'right', fontFamily: FONT_BOLD }]}>
            {formatNote(details.note)}
          </Text>
        </View>
        
        {/* Hình thức chuyển */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.method.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, { textAlign: POS.method.align, fontFamily: FONT_BOLD }]}>{'Chuyển tiền nhanh\n24/7'}</Text>
        </View>

        {/* Phí */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.fee.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, { fontFamily: FONT_BOLD }]}>{details.fee === 0 ? 'Miễn phí' : `${formatVNCurrency(details.fee)} VND`}</Text>
        </View>

        {/* Mã giao dịch */}
        <View style={[confirmStyles.valueContainer, { top: by(POS.transId.top), right: 32, left: 35 }]}>
          <Text style={[confirmStyles.value, { textAlign: 'right' }]}><Text style={{ fontFamily: FONT_BOLD }}>{transactionId}</Text></Text>
        </View>
      </ImageBackground>
</ScrollView>

      {/* Overlay đáy + vùng chạm */}
      <Image
        source={BottomOverlaySuccess}
        style={{ position: 'absolute', left: 0, bottom: 0, width: SW, height: BOTTOM_OVERLAY_SUCCESS_HEIGHT }}
        resizeMode="contain"
        pointerEvents="none"
      />

      {/* Vùng chạm “Thực hiện giao dịch mới” (bên trái) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'Transfer' }],
          })
        }
        style={{ position: 'absolute', left: SW * 0.08, bottom: 16, width: SW * 0.55, height: 56 }}
      />

      {/* Vùng chạm “Về trang chủ” (icon nhà bên phải) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.reset({
            index: 1,
            routes: [{ name: 'Login2' }, { name: 'Home' }],
          })
        }
        style={{ position: 'absolute', right: SW * 0.08, bottom: 16, width: 56, height: 56 }}
      />
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */
const headerButtonStyles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        width: 50,
        height: 50,
        zIndex: 100,
    },
    homeButton: {
        position: 'absolute',
        top: 50,
        right: 10,
        width: 50,
        height: 50,
        zIndex: 100,
    }
});

const successStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: SH * 0.23,
    },
    amountText: {
        fontFamily: FONT_HEAVY,
        fontSize: 32,
        color: '#00642B',
    },
    timestampText: {
        fontFamily: FONT_REG,
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    detailsContainer: {
        width: '100%',
        paddingHorizontal: 40,
        marginTop: SH * 0.08,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        minHeight: 48,
        paddingVertical: 4,
    },
    valueText: {
        fontFamily: FONT_SEMI,
        fontSize: 16,
        color: '#333',
        textAlign: 'right',
    },
    saveTemplateContainer: {
        width: '100%',
        paddingHorizontal: 40,
        height: 48,
        marginTop: 8,
    },
});


const otpStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: SW * 0.9,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e6f0ea',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontFamily: FONT_HEAVY,
        fontSize: 18,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: FONT_REG,
        fontSize: 15,
        textAlign: 'center',
        color: '#555',
        marginBottom: 25,
        lineHeight: 22,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpBox: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxFocused: {
        borderColor: '#009245',
        borderWidth: 2,
    },
    otpText: {
        fontSize: 22,
        fontFamily: FONT_HEAVY,
    },
    hiddenInput: {
        width: 0,
        height: 0,
        position: 'absolute',
    },
    confirmButton: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: FONT_HEAVY,
        fontSize: 16,
    },
});

const confirmStyles = StyleSheet.create({
    valueContainer: {
        position: 'absolute',
        right: 35,
        left: 35,
        alignItems: 'flex-end',
    },
    value: {
      fontFamily: FONT_SEMI,
      fontSize: 16,
      color: '#000000',
    },
    redText: {
        color: '#e74c3c',
        fontFamily: FONT_HEAVY,
    }
});

const overlayStyles = StyleSheet.create({
  srcAcc: { position:'absolute', color:'#e9f7ee', fontFamily: FONT_HEAVY, fontSize:15, letterSpacing: 1.2 },
  balNumber: { position:'absolute', color:'#fff', fontFamily: FONT_HEAVY, fontSize:22, letterSpacing: 1 },
  balVnd: { position:'absolute', color:'#fff', fontFamily: FONT_SEMI, fontSize:13, opacity:0.7 },
  editableInput: { position:'absolute', color:'#0a0a0a', fontFamily: FONT_SEMI, fontSize:16, padding:0 },
  placeholder: { color:'#9aa1a6', fontFamily: FONT_MEDIUM, fontSize:16, opacity:0.95 },
  bankChosenText: { color:'#0a0a0a', fontFamily: FONT_SEMI, fontSize:16 },
});

const purposeModalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', height: SH * 0.65, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  header: { padding: 16, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontFamily: FONT_HEAVY, fontSize: 17, color: '#111' },
  closeButton: { position: 'absolute', right: 12, top: 12, padding: 8 },
  mainCategoryContainer: { paddingHorizontal: 16, alignItems: 'center' },
  mainCategoryTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 18, marginRight: 10, backgroundColor: '#f0f2f5' },
  mainCategoryTabActive: { backgroundColor: '#e6f0ea' },
  mainCategoryText: { fontFamily: FONT_SEMI, fontSize: 15, color: '#333' },
  mainCategoryTextActive: { color: '#009245' },
  subCategoryItem: { paddingVertical: 16, paddingHorizontal: 20 },
  subCategoryText: { fontFamily: FONT_REG, fontSize: 16, color: '#222' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 20 }
});

const bankStyles = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'flex-end' },
  sheet: { minHeight: SH * 0.90, maxHeight: SH * 0.9, backgroundColor:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16, paddingTop:10, paddingBottom:18 },
  header: { paddingHorizontal:16, paddingVertical:8, alignItems:'center', justifyContent:'center' },
  title: { fontFamily: FONT_HEAVY, fontSize:18, color:'#111' },
  closeBtn: { position:'absolute', right:12, top:10, padding:8 },
  searchRow: { marginTop:8, marginHorizontal:12, backgroundColor:'#f3f5f6', borderRadius:10, flexDirection:'row', alignItems:'center', paddingHorizontal:10, height:44 },
  searchInput: { flex:1, color:'#111', fontSize:16 },
  item: { paddingHorizontal:16, paddingVertical:12, flexDirection:'row', alignItems:'center', backgroundColor:'#fff' },
  itemName: { fontFamily: FONT_HEAVY, color:'#222', fontSize:15 },
  itemSub:  { color:'#6d7378', marginTop:2, fontSize:13 },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  sheet: { width:'86%', backgroundColor:'#fff', borderRadius:16, padding:16 },
  title: { fontSize:16, fontFamily: FONT_HEAVY, marginBottom:10 },
  label: { fontFamily: FONT_HEAVY, marginBottom:6, marginTop:6 },
  input: { borderWidth:1, borderColor:'#ddd', borderRadius:12, paddingHorizontal:12, paddingVertical:10, marginBottom:12, backgroundColor:'#fff', color:'#111' },
  row: { flexDirection:'row', justifyContent:'flex-end', gap:12 },
  btn: { backgroundColor:'#009245', paddingHorizontal:16, paddingVertical:10, borderRadius:10 },
  btnGhost: { paddingHorizontal:16, paddingVertical:10 },
});

const styles = StyleSheet.create({
  langPill: { position: 'absolute', top: 100, right: 16, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  langFlag: { color: '#fff', fontSize: 12 },
  langText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  loginGuide: { fontSize: 14, opacity: 0.95 },
  inputRow: { width: '100%', backgroundColor: '#fff', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  inputIcon: { fontSize: 12, marginRight: 8, color: '#222' },
  phoneInput: { flex: 1, color: '#111', fontSize: 16 },
  expBtn: { width: '100%', height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  expIcon: { width: 24, height: 24, marginRight: 8 }, // Sửa đổi: style cho logo
  expText: { color: '#fff', fontWeight: '700' },
  pwdRow: { width: '100%', backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
  pwdInput: { flex: 1, color: '#111', fontSize: 16 },
  loginBtn: { height: 43, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#fff', fontFamily: FONT_HEAVY, fontSize: 16 },

  inputRow: {
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 15,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  height: 48,
  shadowColor: '#000',
  shadowOpacity: 0.10,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
},
phoneInput: {
  flex: 1,            // 👈 đảm bảo chiếm toàn bộ khoảng trống
  height: '100%',     // 👈 cao bằng container để bấm vào đâu cũng focus
  color: '#111',
  fontSize: 16,
},
  expBtn: {
    width: '100%',
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});