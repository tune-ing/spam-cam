<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the original localStorage event key when changing the app name, so existing users retain their saved events.
- Export both individual and whole-calendar ICS files from the shared event formatter, so titles and attribution stay consistent.
- Keep the landing, scan, and calendar views in the existing single-page route so navigation does not duplicate app state or reset unsaved scans.
- Keep action-green and bottom-navigation-purple hover roles in semantic tokens so each button stays in its color family across states.
