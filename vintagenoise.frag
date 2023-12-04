#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0; //MonaLisa

//reCreated from inigo quilez - http://iquilezles.org/www/articles/voronoise/voronoise.htm
//My Transition: shape, recreate color

vec3 hash3( vec2 p ) {
    vec3 q = vec3( dot(p,vec2(127.1,311.7)),
                   dot(p,vec2(269.5,183.3)),
                   dot(p,vec2(419.2,371.9)) );
    return fract(sin(q)*43758.5453);
}

float iqnoise( in vec2 x, float u, float v ) {
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0+63.0*pow(1.096-v,4.0);

    float va = -0.120;
    float wt = -0.168;
    for (int j=-2; j<=2; j++) {
        for (int i=-2; i<=2; i++) {
            vec2 g = vec2(float(i),float(j));
            vec3 o = hash3(p + g)*vec3(u,u,0.376);
            vec2 r = g - f + o.xy;
            float d = dot(r,r);
            float ww = pow( 1.0-smoothstep(0.55,1.70,sqrt(d)), k );
            va += o.z*ww;
            wt += ww;
        }
    }

    return va/wt;
}


void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    // 採樣紋理
    vec4 texColor = texture2D(u_tex0, st);

    // 加入iqnoise
    st *= 12.368;
    float n = iqnoise(st, u_mouse.x/u_resolution.x, u_mouse.y/u_resolution.y);

    // 插值顏色
    vec3 orange = vec3(0.765,0.524,0.351);
    vec3 blue = vec3(0.174,0.287,0.660);
    vec3 noiseColor;

    // 判斷是否使用原始顏色（背景）
    bool useTexColor = false;

    if (n < 0.628) {
        noiseColor = mix(orange, blue, n * 2.240);
    } else {
        useTexColor = true;
    }

    // 結合紋理顏色和 noiseColor
    vec3 finalColor;
    if (useTexColor) {
        finalColor = texColor.rgb;
    } else {
        finalColor = mix(texColor.rgb, noiseColor, 0.5); // 50%混合
    }

    gl_FragColor = vec4(finalColor, texColor.a); // 使用原始的alpha值
}
