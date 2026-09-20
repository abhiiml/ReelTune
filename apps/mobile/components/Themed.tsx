import { Text as DefaultText, View as DefaultView } from 'react-native';
import { Colors } from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
) {
  const color = props.dark ?? Colors.textPrimary;
  return color;
}

export function Text(props: TextProps) {
  const { style, lightColor: _l, darkColor, ...otherProps } = props;
  const color = darkColor ?? Colors.textPrimary;
  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor: _l, darkColor, ...otherProps } = props;
  const backgroundColor = darkColor ?? Colors.bgPrimary;
  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
