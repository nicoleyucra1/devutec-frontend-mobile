import { useEffect, useRef } from 'react'
import { Animated, Easing, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import { useThemedStyles } from '../../hooks/useTheme'

// Separa **negrita** del resto del texto
function RichText({ text, style, boldStyle }) {
  return (
    <Text style={style}>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={index} style={boldStyle}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  )
}

// Un mensaje del chat que aparece subiendo. Los de Cuyi llevan su carita al lado, como si él respondiera.
export default function ChatBubble({ role, text, anim = 'saluda', children }) {
  const styles = useThemedStyles(createStyles)
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [progress])

  const appear = {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  }

  if (role === 'user') {
    return (
      <Animated.View style={[styles.userRow, appear]}>
        <Text style={styles.userText}>{text}</Text>
      </Animated.View>
    )
  }
  return (
    <Animated.View style={[styles.botRow, appear]}>
      <View style={styles.avatar}>
        <Cuyi anim={anim} size={26} />
      </View>
      <View style={styles.botBubble}>
        {text ? <RichText text={text} style={styles.botText} boldStyle={styles.bold} /> : null}
        {children}
      </View>
    </Animated.View>
  )
}

RichText.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  boldStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
}

ChatBubble.propTypes = {
  role: PropTypes.oneOf(['user', 'assistant']).isRequired,
  text: PropTypes.string,
  anim: PropTypes.oneOf(['saluda', 'escribe', 'celebra', 'duerme', 'confundido']),
  children: PropTypes.node,
}

const createStyles = ({ colors, fonts }) => ({
  userRow: { alignSelf: 'flex-end', maxWidth: '82%' },
  userText: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '88%' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  botBubble: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  botText: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  bold: { fontFamily: fonts.semibold },
})
