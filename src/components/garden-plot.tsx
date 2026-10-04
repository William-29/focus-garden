import { Pressable, Text } from 'react-native';
import type { Plant } from "../data/plants";

type GardenPlotProps = {
    plant?: Plant;
    onPress: () => void;
};

export default function GardenPlot({
    plant,
    onPress,
}: GardenPlotProps) {
    return (
        <Pressable onPress ={onPress}>
            {plant ? (
                <Text>{plant.name}</Text>
            ) : (
                <Text>Empty Plot</Text>
            )}
        </Pressable>
    );
}
