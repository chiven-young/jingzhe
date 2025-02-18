<template>
    <div class="login-container">
        <div class="wrapper">
            <!-- <div class="placeholder">
                
            </div> -->
            <div class="login-form">
                <!-- <div class="login-form-logo-wrap">
                    <div class="login-form-logo">
                        <span>内容工厂</span>
                    </div>
                </div> -->
                <div v-if="formType == 'login'" class="login-form-title">欢迎回来</div>
                <div v-if="formType == 'register'" class="login-form-title">注册新账号</div>
                <div v-if="formType == 'wxQrCode'" class="login-form-title" @click="closeWechatQrCode">
                    <Icon icon="ArrowBackRound" />
                </div>
                <!-- <div v-if="formType !== 'wxQrCode'" class="login-form-other">
                    <el-button class="login-form-other-main-btn" @click="loginByWechat">
                        <img :src="iconWechat" />
                        微信登录
                    </el-button>
                    <el-button @click="loginByWechat">
                        <Icon icon="QrCodeRound" />
                    </el-button>
                </div>
                <div v-if="formType !== 'wxQrCode'" class="or-online">
                    <span class="line"></span>
                    <span>或</span>
                    <span class="line"></span>
                </div> -->
                <div v-show="formType == 'wxQrCode'" id="wxqrcode" class="login-form-main"></div>
                <div v-if="formType == 'login'" class="login-form-main">
                    <el-form ref="formRefLogin" :model="formDataLogin" :rules="rules">
                        <el-form-item prop="email" :show-label="false">
                            <el-input v-model="formDataLogin.email" placeholder="请填写邮箱" />
                        </el-form-item>
                        <el-form-item :show-label="false">
                            <el-input v-model="formDataLogin.password" type="password" show-password
                            @keydown.enter.prevent="loginSubmit(formRefLogin)" placeholder="密码" />
                        </el-form-item>
                        <el-button :disabled="formDataLogin.email === null" type="primary" @click="loginSubmit(formRefLogin)">
                            登录
                        </el-button>
                    </el-form>
                </div>
                <div v-if="formType == 'register'" class="login-form-main">
                    <el-form ref="formRefRegister" :model="formDataRegister" :rules="rules">
                        <el-form-item prop="name" :show-label="false">
                            <el-input v-model="formDataRegister.name" @keydown.enter.prevent placeholder="用户名" />
                        </el-form-item>
                        <el-form-item prop="email" :show-label="false">
                            <el-input v-model="formDataRegister.email" @keydown.enter.prevent placeholder="请填写邮箱" />
                        </el-form-item>
                        <!-- <el-form-item prop="phone" :show-label="false">
                            <el-input
                                v-model:value="formDataRegister.phone"
                                @keydown.enter.prevent
                                placeholder="请填写手机号"
                            />
                        </el-form-item> -->
                        <el-form-item path="password" :show-label="false">
                            <el-input v-model="formDataRegister.password" type="password" @keydown.enter.prevent
                                placeholder="请填写密码" />
                        </el-form-item>
                        <el-form-item ref="rPasswordFormItemRef" first prop="reenteredPassword" :show-label="false">
                            <el-input v-model="formDataRegister.reenteredPassword"
                                :disabled="!formDataRegister.password" prop="password" @keydown.enter.prevent
                                placeholder="请重新填写密码" />
                        </el-form-item>
                        <el-button :disabled="formDataRegister.name === null" type="primary" @click="registerSubmit(formRefRegister)">
                            注册
                        </el-button>
                    </el-form>
                </div>
                <div class="operations-wrap">
                    <div v-if="formType == 'login'" class="text-btn-wrap">
                        <span class="text-btn-label">还没有账号?</span>
                        <span class="text-btn" @click="formType = 'register'">前往注册</span>
                    </div>
                    <div v-if="formType == 'register'" class="text-btn-wrap">
                        <span class="text-btn-label">已有账号?</span>
                        <span class="text-btn" @click="formType = 'login'">立即登录</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from "vue-router"
import zApi from '@/core';
import { checkEmail, checkPhone } from '@/utils/tools';
import { ElMessage } from 'element-plus';
const router = useRouter();

const pageData = reactive({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    staticBaseUrl: import.meta.env.VITE_STATIC_BASE_URL
})

let wwLogin;
// 生成微信登录二维码
const createWxQrcode = () => {
    wwLogin = new WwLogin({
        "id": "wxqrcode",
        "appid": "wwba36a2524e5d9905",
        "agentid": 1000002,
        "redirect_uri": encodeURIComponent(pageData.staticBaseUrl + "/#/code"),
        "state": "",
        "href": "",
        "lang": "zh",
    })
}
// 微信登录
const loginByWechat = () => {
    formType.value = 'wxQrCode';
    createWxQrcode();
}
// 关闭微信登录二维码
const closeWechatQrCode = () => {
    formType.value = 'login';
    wwLogin.destroyed()
}
// 当前显示表单面板类型
const formType = ref('login');

// 登录表单
const formDataLogin = reactive({
    email: null,
    password: null
})
// 注册表单
const formDataRegister = reactive({
    name: null,
    password: null,
    email: null,
    phone: null,
    age: null,
    sex: null,
})

// 检查密码是否符合规范
function validatePasswordStartWith(rule, value) {
    var passwordreg = /(?![A-Z]*$)(?![a-z]*$)(?![0-9]*$)(?![^a-zA-Z0-9]*$)/;
    return passwordreg.test(value)
}
// 检查校验密码是否一致
function validatePasswordSame(rule, value) {
    return value === formDataRegister.password;
}
const rules = {
    name: [
        {
            required: true,
            message: "请输入用户名",
            trigger: "blur"
        },
    ],
    email: [
        {
            required: true,
            message: "请输入邮箱",
            trigger: "blur"
        },
        {
            validator: checkEmail,
            message: "邮箱格式错误",
            trigger: "blur"
        },
    ],
    phone: [
        {
            required: true,
            message: "请输入手机号",
            trigger: "blur"
        },
        {
            validator: checkPhone,
            message: "手机号格式错误",
            trigger: "blur"
        },
    ],
    age: [
        {
            required: true,
            validator(rule, value) {
                if (!value) {
                    return new Error("需要年龄");
                } else if (!/^\d*$/.test(value)) {
                    return new Error("年龄应该为整数");
                } else if (Number(value) < 18) {
                    return new Error("年龄应该超过十八岁");
                }
                return true;
            },
            trigger: ["input", "blur"]
        }
    ],
    password: [
        {
            required: true,
            message: "请输入密码",
            trigger: "blur"
        },
        {
            validator: validatePasswordStartWith,
            message: "密码必须由大写字母、小写字母、数字、特殊符号中的2种及以上类型组成!",
            trigger: "blur"
        },
    ],
    reenteredPassword: [
        {
            required: true,
            message: "请再次输入密码",
            trigger: "blur"
        },
        {
            validator: validatePasswordSame,
            message: "两次密码输入不一致",
            trigger: ["blur", "password-input"]
        }
    ]
};

// 登录
const userLogin = async () => {
    let result = await zApi.user.login(formDataLogin);
    if (result?.uid) {
        router.push({ path: '/library/index' })
        ElMessage({
            message: '登录成功',
            type: 'success',
        })
    } else {
        ElMessage({
            message: result,
            type: 'error',
        })
    }
}

// 登录表单提交
const formRefLogin = ref(null);
const loginSubmit = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            userLogin();
            console.log('login');
        } else {
            console.log('error submit!')
            return false
        }
    })
}

// 注册
const userRegister = async () => {
    console.log('formDataRegister', formDataRegister);
    let result = await zApi.user.register(formDataRegister)
    if (result?.data) {
        // 注册成功后自动登录
        formDataLogin.email = formDataRegister.email;
        formDataLogin.password = formDataRegister.password;
        ElMessage({
            message: '注册成功',
            type: 'success',
        })
        userLogin();
    } else {
        ElMessage({
            message: "注册失败," + result?.message,
            type: 'error',
        })
    }
}
// 注册表单提交
const formRefRegister = ref(null);
const registerSubmit = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            userRegister();
        } else {
            console.log('error submit!')
            return false
        }
    })
}

// 跳转链接
const goToUrl = (url) => {
    window.location.href = url;
}
// 跳转路由
const goToPage = (path) => {
    router.push({ path: path })
}
onMounted(() => {

})
</script>
    
<style lang="scss" scoped>
.login-container {
    height: 100vh;
    width: 100%;
    display: flex;
    display: -webkit-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: rgba(128, 128, 128, 0.04);

    .wrapper {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        width: 100%;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        border-radius: 12px;

        .placeholder {
            width: 750px;
            height: 538px;
            margin-right: 82px;
            position: relative;
            border: 1px solid;
            border-color: var(--el-border-color);
            box-sizing: border-box;
            border-radius: 8px;

            img {
                width: 100%;
                height: 100%;
                /* object-fit: cover; */
                position: absolute;
            }
        }

        .login-form {
            max-width: 300px;
            border: 1px solid var(--el-border-color);
            border-radius: 8px;
            -webkit-backdrop-filter: blur(30px);
            backdrop-filter: blur(30px);
            padding: 32px;

            .login-form-logo {
                text-align: center;
                font-size: 20px;
                font-weight: 600;
                padding-bottom: 20px;

                img {
                    height: 28px;
                    margin-right: 6px;
                    vertical-align: top;
                }
            }

            .login-form-title {
                font-weight: 600;
                font-size: 18px;
                line-height: 27px;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                position: relative;
                margin-bottom: 16px;
            }

            .login-form-other {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                justify-content: space-between;
            }

            .login-form-other-main-btn {
                -webkit-box-flex: 1;
                -ms-flex: 1;
                flex: 1;
                margin-right: 8px;
            }

            .login-form-main {
                margin-bottom: 20px;

                button {
                    width: 100%;
                }
            }
        }
    }
}

button img {
    width: 20px;
    height: 20px;
    margin-right: 6px;
}

.or-online {
    display: grid;
    grid-template-columns: auto 30px auto;
    align-items: center;
    text-align: center;
    font-size: 12px;
    opacity: 0.5;
    margin: 12px 0;
}

.or-online .line {
    background-color: rgba(128, 128, 128, 0.5);
    height: 1px;
}

.text-btn-wrap {
    font-weight: 600;
    font-size: 12px;
    line-height: 22px;
    margin-bottom: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}

.text-btn-label {
    margin-right: 3px;
}

.text-btn {
    text-align: center;
    padding: 0 6px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    color: #507afc;
    cursor: pointer;
}

.login-form-main::v-deep iframe {
    width: 100%;
}
</style>