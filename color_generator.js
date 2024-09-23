
const application = Stimulus.Application.start();

application.register("color", class extends Stimulus.Controller {

    static get targets() {
        return ["variationInput", "variationType", "container"];
    }

    connect() {
        // Array of objects containing the base hex codes and their associated device types.
        this.baseColors = [
            { hex: '#2171B5', deviceType: 'Pressure Controller' }, //#003F5C
            { hex: '#016C59', deviceType: 'Sensor' }, //#016C59
            { hex: '#7A5195', deviceType: 'Pumping Station' },
            { hex: '#BC5090', deviceType: 'Flow meter' },
            { hex: '#EF5675', deviceType: 'Mesh/Repeater' },
            { hex: '#FFA600', deviceType: 'Mesh/Gateway' },
        ];
        this.numberOfVariations = parseInt(this.variationInputTarget.value) || 2; 
        this.variationTypeTarget.value;
        this.displayColors();
    }

    updateColors(){
        this.numberOfVariations = parseInt(this.variationInputTarget.value);
        this.variationMethod = this.variationTypeTarget.value;
        this.containerTarget.innerHTML = '';
        this.displayColors();
    }

    // Display colors on the page
    displayColors() {
        this.baseColors.forEach((baseColor) => {
            const deviceSection = document.createElement('div');
            deviceSection.classList.add('device-section');

            const deviceTitle = document.createElement('div');
            deviceTitle.classList.add('device-title');
            deviceTitle.textContent = baseColor.deviceType;
            deviceSection.appendChild(deviceTitle);

            const colorGrid = document.createElement('div');
            colorGrid.classList.add('color-grid');

            let colors = [];
            if (this.variationMethod === 'lightness') {
                colors = this.generateColorLightnessVariations(baseColor.hex, this.numberOfVariations);
            } else if (this.variationMethod === 'hue') {
                colors = this.generateColorHueVariations(baseColor.hex, this.numberOfVariations);
            } else if (this.variationMethod === 'multiHue') {
                colors = this.generateColorMultiHueVariations(baseColor.hex, this.numberOfVariations);
            } else if (this.variationMethod == 'saturation') {
                colors = this.generateColorSaturationVariations(baseColor.hex, this.numberOfVariations);
            }

            colors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = color;
                //colorBox.textContent = color;

                // Adjust text color for better readability
                const hsl = this.hexToHSL(color);
                colorBox.style.color = hsl.l > 50 ? '#000' : '#fff';
                colorGrid.appendChild(colorBox);
            });

            deviceSection.appendChild(colorGrid);
            this.containerTarget.appendChild(deviceSection);
        });
    }


    // Method to generate color variations
    generateColorLightnessVariations(baseHex, count) {
        const hsl = this.hexToHSL(baseHex);
        const colors = [];
        const maxLightness = 95;
        // Determines the amont by which the lightness will increase with each color variation
        const lightnessIncrement = (maxLightness - hsl.l) / (count - 1); //Define maximum lightness bellow 100 to avoid pure white

        //Loop to assign new color for each variation
        for (let i = 0; i < count; i++) {
            const newLightness = hsl.l + i * lightnessIncrement;
            const newHex = this.hslToHex(hsl.h, hsl.s, newLightness);
            colors.push(newHex);
        }
        return colors;
    }

    generateColorHueVariations(baseHex, count) {
        const hsl = this.hexToHSL(baseHex);
        const colors = [];
        const hueIncrement = 360 / count; //Full circle divided by the number of variations

        //Loop to assign new color for each variation
        for (let i = 0; i < count; i++) {
            const newHue = (hsl.h + i * hueIncrement) % 360;
            const newHex = this.hslToHex(newHue, hsl.s, hsl.l);
            colors.push(newHex);
        }
        return colors;
    }

    generateColorMultiHueVariations(baseHex, count) {
        const hsl = this.hexToHSL(baseHex);
        const colors = [];
        const hueRange = 60; 
        const startHue = hsl.h;
        const endHue = (hsl.h + hueRange) % 360;
        let hueIncrement;

        if (endHue >= startHue) {
            hueIncrement = (endHue - startHue) / (count-1);
        } else {
            hueIncrement = ((360 - startHue) + endHue) / (count-1);
        }

        //Loop to assign new color for each variation
        for (let i = 0; i < count; i++) {
            let newHue = (startHue + i * hueIncrement) % 360;
            const newHex = this.hslToHex(newHue, hsl.s, hsl.l);
            colors.push(newHex);
        }
        return colors;
    }

    // Method to generate color variations
    generateColorSaturationVariations(baseHex, count) {
        const hsl = this.hexToHSL(baseHex);
        const colors = [];
        const startSaturation = hsl.s;
        const endSaturation = (hsl.s + 20) % 100;
        const saturationIncrement = (endSaturation - startSaturation) / (count - 1);

        
        //Loop to assign new color for each variation
        for (let i = 0; i < count; i++) {
            const newSaturation = startSaturation + i * saturationIncrement;
            const newHex = this.hslToHex(hsl.h, newSaturation, hsl.l);
            colors.push(newHex);
        }
        return colors;
    }


    //Mathematical Transformations
    hexToHSL(H) {
        let r = 0, g = 0, b = 0;
        if (H.length == 4) {
            r = "0x" + H[1] + H[1];
            g = "0x" + H[2] + H[2];
            b = "0x" + H[3] + H[3];
        } else if (H.length == 7) {
            r = "0x" + H[1] + H[2];
            g = "0x" + H[3] + H[4];
            b = "0x" + H[5] + H[6];
        }
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // Achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0));
                    break;
                case g:
                    h = ((b - r) / d + 2);
                    break;
                case b:
                    h = ((r - g) / d + 4);
                    break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);

        const rgb = [f(0), f(8), f(4)].map(x => Math.round(x * 255));
        return '#' + rgb.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
});