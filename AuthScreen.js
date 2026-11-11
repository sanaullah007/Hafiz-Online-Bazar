import React,{useState} from 'react';
import {View,Text,TextInput,ScrollView,TouchableOpacity,StyleSheet,Alert,ActivityIndicator,KeyboardAvoidingView,Platform} from 'react-native';
import {supabase,isAuthConfigured} from './authClient';

const GREEN='#164E3A';
const normalizePhone=(v)=>v.trim().replace(/[\s()-]/g,'');
export default function AuthScreen(){
 const [mode,setMode]=useState('login');
 const [method,setMethod]=useState('email');
 const [email,setEmail]=useState('');
 const [phone,setPhone]=useState('');
 const [name,setName]=useState('');
 const [password,setPassword]=useState('');
 const [otp,setOtp]=useState('');
 const [busy,setBusy]=useState(false);
 const [awaitingOtp,setAwaitingOtp]=useState(false);
 const isPhone=method==='phone';
 const identifier=isPhone?normalizePhone(phone):email.trim().toLowerCase();
 const action=async()=>{
  if(!isAuthConfigured){Alert.alert('Configuration required','Add Supabase URL and publishable/anon key to the build environment.');return;}
  if(!identifier || (!awaitingOtp && mode!=='reset' && !password) || (mode==='signup'&&!name.trim())){
   Alert.alert('Missing information','Please complete the required fields.');return;
  }
  if(isPhone&&!/^\+[1-9]\d{7,14}$/.test(identifier)){
   Alert.alert('Phone number','Use an international number, e.g. +93700123456.');return;
  }
  if(!isPhone&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)){
   Alert.alert('Email address','Enter a valid email address.');return;
  }
  setBusy(true);
  try{
   if(awaitingOtp){
    if(!otp.trim()){Alert.alert('Verification','Enter the SMS or email verification code.');return;}
    const {error}=await supabase.auth.verifyOtp(isPhone?
     {phone:identifier,token:otp.trim(),type:'sms'}:
     {email:identifier,token:otp.trim(),type:'email'});
    if(error)throw error;
    setAwaitingOtp(false);
    Alert.alert('Success','Your account has been verified.');
   }else if(mode==='signup'){
    const {data,error}=await supabase.auth.signUp(isPhone?
     {phone:identifier,password,options:{data:{full_name:name.trim()}}}:
     {email:identifier,password,options:{data:{full_name:name.trim()}}});
    if(error)throw error;
    if(!data.session){
     setAwaitingOtp(true);
     Alert.alert('Verification required',isPhone?'Enter the SMS code sent to your phone.':'Check your email for verification. If you received a confirmation link, open it and then log in.');
    }
   }else if(mode==='reset'){
    if(isPhone){
     const {error}=await supabase.auth.signInWithOtp({phone:identifier});
     if(error)throw error;
     setAwaitingOtp(true);
     Alert.alert('SMS sent','Use the SMS code to sign in, then change your password in account settings.');
    }else{
     const {error}=await supabase.auth.resetPasswordForEmail(identifier);
     if(error)throw error;
     Alert.alert('Email sent','If an account exists, password reset instructions will be emailed to you.');
    }
   }else{
    const {error}=await supabase.auth.signInWithPassword(isPhone?
     {phone:identifier,password}:{email:identifier,password});
    if(error)throw error;
   }
  }catch(e){Alert.alert('Authentication error',e?.message||'Please try again.');}
  finally{setBusy(false);}
 };
 const switchMode=(v)=>{setMode(v);setAwaitingOtp(false);setOtp('');};
 return <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':undefined}>
  <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
   <View style={s.brand}><Text style={s.logo}>H</Text><Text style={s.title}>Hafiz Online Bazar</Text><Text style={s.subtitle}>خپل حساب ته داخل شئ یا نوی حساب جوړ کړئ</Text></View>
   {!isAuthConfigured&&<View style={s.warning}><Text style={s.warningText}>Login requires Supabase configuration. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in the build environment.</Text></View>}
   <View style={s.card}>
    <View style={s.switchRow}>
     <TouchableOpacity style={[s.switch,mode==='login'&&s.selected]} onPress={()=>switchMode('login')}><Text style={[s.switchLabel,mode==='login'&&s.selectedText]}>Login</Text></TouchableOpacity>
     <TouchableOpacity style={[s.switch,mode==='signup'&&s.selected]} onPress={()=>switchMode('signup')}><Text style={[s.switchLabel,mode==='signup'&&s.selectedText]}>Sign Up</Text></TouchableOpacity>
    </View>
    <View style={s.switchRow}>
     <TouchableOpacity style={[s.switch,method==='email'&&s.selected]} onPress={()=>{setMethod('email');setAwaitingOtp(false);}}><Text style={[s.switchLabel,method==='email'&&s.selectedText]}>✉️ Email</Text></TouchableOpacity>
     <TouchableOpacity style={[s.switch,method==='phone'&&s.selected]} onPress={()=>{setMethod('phone');setAwaitingOtp(false);}}><Text style={[s.switchLabel,method==='phone'&&s.selectedText]}>📱 Phone</Text></TouchableOpacity>
    </View>
    {mode==='signup'&&!awaitingOtp&&<TextInput style={s.input} placeholder="Full name / بشپړ نوم" autoCapitalize="words" value={name} onChangeText={setName}/>}
    <TextInput style={s.input} placeholder={isPhone?'Phone (+93700123456)':'Email address'} keyboardType={isPhone?'phone-pad':'email-address'} autoCapitalize="none" autoCorrect={false} value={isPhone?phone:email} onChangeText={isPhone?setPhone:setEmail}/>
    {awaitingOtp?<TextInput style={s.input} placeholder="Verification code" keyboardType="number-pad" value={otp} onChangeText={setOtp}/>:
     mode!=='reset'&&<TextInput style={s.input} placeholder="Password (at least 6 characters)" secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword}/>}
    <TouchableOpacity style={[s.submit,busy&&s.disabled]} disabled={busy||!isAuthConfigured} onPress={action}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.submitText}>{awaitingOtp?'Verify code':mode==='signup'?'Create account':mode==='reset'?'Reset password':'Log in'}</Text>}</TouchableOpacity>
    {mode!=='reset'?<TouchableOpacity onPress={()=>switchMode('reset')}><Text style={s.link}>Forgot password?</Text></TouchableOpacity>:<TouchableOpacity onPress={()=>switchMode('login')}><Text style={s.link}>Back to login</Text></TouchableOpacity>}
    <Text style={s.note}>For phone registration, SMS verification and a configured SMS provider are required. An email signup may require email confirmation.</Text>
   </View>
  </ScrollView>
 </KeyboardAvoidingView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#F5F7F4'},body:{flexGrow:1,justifyContent:'center',padding:22},brand:{alignItems:'center',marginBottom:24},logo:{fontSize:38,fontWeight:'900',color:'#E5AB43',backgroundColor:GREEN,overflow:'hidden',borderRadius:20,paddingHorizontal:24,paddingVertical:14},title:{fontSize:26,fontWeight:'900',color:GREEN,marginTop:14},subtitle:{fontSize:14,color:'#526B58',marginTop:6,textAlign:'center'},card:{padding:18,backgroundColor:'white',borderRadius:18,elevation:2},switchRow:{flexDirection:'row',backgroundColor:'#EDF3EF',borderRadius:12,marginBottom:16,padding:4},switch:{flex:1,padding:12,alignItems:'center',borderRadius:9},selected:{backgroundColor:GREEN},switchLabel:{color:GREEN,fontWeight:'700'},selectedText:{color:'white'},input:{borderColor:'#DAE5DC',borderWidth:1,borderRadius:11,padding:14,marginBottom:13,fontSize:15},submit:{backgroundColor:GREEN,borderRadius:11,padding:16,alignItems:'center'},disabled:{opacity:.55},submitText:{color:'white',fontWeight:'800',fontSize:16},link:{textAlign:'center',color:GREEN,marginTop:18,fontWeight:'700'},note:{fontSize:11,color:'#718275',textAlign:'center',marginTop:20},warning:{backgroundColor:'#FFF1D5',padding:14,borderRadius:12,marginBottom:16},warningText:{color:'#745310',fontSize:12}});
