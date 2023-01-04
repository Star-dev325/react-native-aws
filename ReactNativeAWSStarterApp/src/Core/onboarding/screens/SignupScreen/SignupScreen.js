import React, { useState } from 'react'
import {
  Alert,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Button from 'react-native-button'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'
import { useTheme, useTranslations } from 'dopenative'
import dynamicStyles from './styles'
import TNActivityIndicator from '../../../truly-native/TNActivityIndicator'
import TNProfilePictureSelector from '../../../truly-native/TNProfilePictureSelector/TNProfilePictureSelector'
import { setUserData } from '../../redux/auth'
import { localizedErrorMessage } from '../../api/ErrorCode'
import TermsOfUseView from '../../components/TermsOfUseView'
import { useOnboardingConfig } from '../../hooks/useOnboardingConfig'
import { useAuth } from '../../hooks/useAuth'

const SignupScreen = props => {
  const { navigation } = props
  const authManager = useAuth()
  const dispatch = useDispatch()

  const { config } = useOnboardingConfig()
  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const [inputFields, setInputFields] = useState({})

  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const validateEmail = text => {
    let reg =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(String(text).toLowerCase()) ? true : false
  }

  const validatePassword = text => {
    let reg = /^(?=.*[A-Z])(?=.*[a-z])/
    return reg.test(String(text)) ? true : false
  }

  const trimFields = fields => {
    var trimmedFields = {}
    Object.keys(fields).forEach(key => {
      if (fields[key]) {
        trimmedFields[key] = fields[key].trim()
      }
    })
    return trimmedFields
  }

  const onRegister = async () => {
    const { error: usernameError } =
      await authManager.validateUsernameFieldIfNeeded(inputFields, config)
    if (usernameError) {
      Alert.alert('', localized(usernameError), [{ text: localized('OK') }], {
        cancelable: false,
      })
      setInputFields(prevFields => ({
        ...prevFields,
        password: '',
      }))
      return
    }

    if (!validateEmail(inputFields?.email?.trim())) {
      Alert.alert(
        '',
        localized('Please enter a valid email address.'),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        },
      )
      return
    }

    if (inputFields?.password?.trim() == '') {
      Alert.alert(
        '',
        localized('Password cannot be empty.'),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        },
      )
      setInputFields(prevFields => ({
        ...prevFields,
        password: '',
      }))
      return
    }

    if (inputFields?.password?.trim()?.length < 6) {
      Alert.alert(
        '',
        localized(
          'Password is too short. Please use at least 6 characters for security reasons.',
        ),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        },
      )
      setInputFields(prevFields => ({
        ...prevFields,
        password: '',
      }))
      return
    }

    setLoading(true)

    const userDetails = {
      ...trimFields(inputFields),
      photoFile: profilePictureFile,
      appIdentifier: config.appIdentifier,
    }
    if (userDetails.username) {
      userDetails.username = userDetails.username?.toLowerCase()
    }

    authManager
      .createAccountWithEmailAndPassword(userDetails, config)
      .then(response => {
        if (response.confirmcode) {
          // navigate to confirmationcode screen
          return navigation.push('Sms', {
            isSigningUp: true,
            isConfirmSignUpCode: true,
            userInfo: userDetails,
          })
        }
        const user = response.user
        if (user) {
          dispatch(setUserData({ user }))
          Keyboard.dismiss()
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainStack', params: { user } }],
          })
        } else {
          setLoading(false)
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{ text: localized('OK') }],
            {
              cancelable: false,
            },
          )
        }
      })
  }

  const onChangeInputFields = (text, key) => {
    setInputFields(prevFields => ({
      ...prevFields,
      [key]: text,
    }))
  }

  const renderInputField = (field, index) => {
    return (
      <TextInput
        key={index?.toString()}
        style={styles.InputContainer}
        placeholder={field.placeholder}
        placeholderTextColor="#aaaaaa"
        secureTextEntry={field.secureTextEntry}
        onChangeText={text => onChangeInputFields(text, field.key)}
        value={inputFields[field.key]}
        keyboardType={field.type}
        underlineColorAndroid="transparent"
        autoCapitalize={field.autoCapitalize}
      />
    )
  }

  const renderSignupWithEmail = () => {
    return (
      <>
        {config.signupFields.map(renderInputField)}
        <Button
          containerStyle={styles.signupContainer}
          style={styles.signupText}
          onPress={() => onRegister()}>
          {localized('Sign Up')}
        </Button>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps="always">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>
        <Text style={styles.title}>{localized('Create new account')}</Text>
        <TNProfilePictureSelector
          setProfilePictureFile={setProfilePictureFile}
        />
        {renderSignupWithEmail()}
        <TermsOfUseView
          tosLink={config.tosLink}
          privacyPolicyLink={config.privacyPolicyLink}
          style={styles.tos}
        />
      </KeyboardAwareScrollView>
      {loading && <TNActivityIndicator />}
    </View>
  )
}

export default SignupScreen
