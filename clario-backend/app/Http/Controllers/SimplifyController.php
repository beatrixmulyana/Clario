<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SimplifyController extends Controller
{
    public function simplify(Request $request)
    {
        $request->validate([
            'original_text' => 'required|string|max:5000',
        ]);

        $text = $request->original_text;

        $quick = $this->simplifyDictionary($text);

        if ($quick !== $text) {
            return response()->json([
                'original_text' => $text,
                'simplified_text' => $quick,
                'source' => 'dictionary-fast'
            ]);
        }      

        $response = Http::withToken(env('OPENAI_API_KEY'))
            ->timeout(60)
            ->post('https://api.openai.com/v1/responses', [
                'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
                'input' => 'Simplify this text for a person with dyslexia. Use short sentences, simple words, and keep the original meaning. Return only the simplified text.' . "\n\n" . $text,
            ]);

        if ($response->successful()) {
            $result = $response->json();
            $simplifiedText = $result['output_text'] ?? null;

            if ($simplifiedText) {
                $simplifiedText = $this->simplifyDictionary($simplifiedText);

                return response()->json([
                    'original_text' => $text,
                    'simplified_text' => $simplifiedText,
                    'source' => 'openai'
                ]);
            }
        }

        $fallback = $this->simplifyDictionary($text);

        return response()->json([
            'original_text' => $text,
            'simplified_text' => $fallback,
            'source' => 'fallback'
        ]);
    }

    private function simplifyDictionary($text)
    {
        $dictionary = [

            // ENGLISH
            "utilize" => "use",
            "purchase" => "buy",
            "assistance" => "help",
            "approximately" => "about",
            "individuals" => "people",
            "commence" => "start",
            "terminate" => "end",
            "numerous" => "many",
            "prior to" => "before",
            "in order to" => "to",
            "demonstrate" => "show",
            "facilitate" => "help",
            "subsequently" => "then",
            "currently" => "now",

            // INDONESIA
            "mengimplementasikan" => "menerapkan",
            "melaksanakan" => "melakukan",
            "menggunakan" => "pakai",
            "berdasarkan" => "dari",
            "dikarenakan" => "karena",
            "sehingga" => "jadi",
            "tersebut" => "itu",
            "diperlukan" => "butuh",
            "memperoleh" => "dapat",
            "menyebabkan" => "bikin",
            "memahami" => "mengerti",
            "menjelaskan" => "menerangkan"
        ];

        uksort($dictionary, function ($a, $b) {
            return strlen($b) - strlen($a);
        });

        foreach ($dictionary as $key => $value) {
            $text = preg_replace('/\b' . preg_quote($key, '/') . '\b/i', $value, $text);
        }

        return $text;
    }
}